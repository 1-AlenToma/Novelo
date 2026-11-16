import { PLAYBACK_START_PRESETS, SerializedTTS_NAMES_List, TTSConfig, TTSNames, TTS_NAMES, onStreamProgress } from "../Types";
import Speech, { SpeechStream, StreamProgressEvent, TTSEngine } from '@pocketpalai/react-native-speech';
import RNFS from 'react-native-fs-turbo';
//import { setBackgroundPlayback } from "./backgroundPlayback";

export class TTSManager implements TTSConfig {
    link = "https://github.com/1-AlenToma/Novelo/releases/download/tts-modolsV2/TTSModols.zip";
    name: TTSNames = "af_bella";
    path: string;
    fullPath: string;
    sampleRate: number = 24000;
    config: { modelPath: string; model_quantized: string, voicesPath: string; tokenizerPath: string, dictPath: string };
    status: "playing" | "paused" | "stopped" | "idle" = "idle";
    currentPlaying: string = "";
    currentStream?: SpeechStream;
    onStreamProgress?: onStreamProgress;
    modoleName = "TTSModols.zip";
    voices: string[] = [];
    isInitialized = false;
    loading = false;
    testLoading = false;
    private isCanceled = false;


    constructor(onStreamProgress?: onStreamProgress) {
        this.path = "tts/kokoro";
        this.fullPath = RNFS.DocumentDirectoryPath.path(this.path);
        this.onStreamProgress = onStreamProgress;
        this.config = {
            modelPath: this.fullPath.path(`model.onnx`),
            model_quantized: this.fullPath.path(`model_quantized.onnx`),
            voicesPath: this.fullPath.path("voices-manifest.json"),
            tokenizerPath: this.fullPath.path(`tokenizer.json`),
            dictPath: this.fullPath.path("en-us.bin"),
        };

        console.log("ttsConfig", this.config)
    }

    get voiceId() {
        return this.name;
    }

    set voiceId(_voiceId: TTSNames) {
        this.name = _voiceId;
    }

    get nameList() {
        return SerializedTTS_NAMES_List;
    }

    async init() {
        console.log("Speach init")
        if (this.isInitialized) return;
        await Speech.initialize({
            engine: TTSEngine.KOKORO,
            modelPath: "file://" + this.config.model_quantized,
            voicesPath: "file://" + this.config.voicesPath,
            tokenizerPath: "file://" + this.config.tokenizerPath,
            dictPath: "file://" + this.config.dictPath,
            phonemizerType: "js",
            maxChunkSize: 600
        });
        if (!this.voices.has())
            this.voices = await Speech.getVoices();
        this.isInitialized = true;
    }


    async stop() {
        console.log("Speach Stop")
        this.isCanceled = true;
        if (this.currentStream) {
            await this.currentStream.cancel();
            this.currentStream = undefined;
        }
        if (typeof Speech.stop === 'function' && this.status === "playing") {
            //  await Speech.stop();
        }
        if (this.loading)
            this.loading = false;
        this.currentPlaying = "";
        this.status = "stopped";
    }


    async testPlay(voice: TTSNames) {
        const textToPlay = "Steam curled from two ceramic mugs on the wooden table. 'You came back,' he said softly, disbelief warming his voice. 'Of course I did—where else would I go?";
        await this.playChapter({ rawText: [textToPlay], voiceId: voice });
    }


    async playChapter({
        rawText,
        voiceId,
        savedParagraphIndex,
        onIndexChanged,
        onProgress,
        onDone,
    }: {
        rawText: string[];
        voiceId: string;
        savedParagraphIndex?: number;
        onIndexChanged?: (newIndex: number, isFinalChunk: boolean) => void | Promise<void>;
        onProgress?: onStreamProgress;
        onDone?: () => void | Promise<void>;
    }) {
        let unsubscribe: (() => void) | undefined = undefined;
        try {
            await this.stop();
            this.loading = typeof onIndexChanged === "function";
            await this.init();
            savedParagraphIndex = savedParagraphIndex ?? 0;
            const chunks = methods.buildChunksFromArray(rawText, savedParagraphIndex);
            if (chunks.length === 0) {
                this.loading = false;
                return;
            }

            const _voices = this.voices.has() ? this.voices : this.nameList.map((x) => x.value);
            const _voiceId = _voices.find((x) => x === voiceId) ?? context.appSettings.ttsVoiceId ?? this.name;
            console.info("Playing, using voice", _voiceId);

            this.loading = typeof onIndexChanged === "function";
            this.isCanceled = false;
            this.status = "playing";
            const stripSettings = PLAYBACK_START_PRESETS.find(x => x.id == (context.appSettings.firstChunkMode ?? "balanced"));
            if (__DEV__)
                    console.info("tts settings", stripSettings)
            const stream = (this.currentStream = Speech.createSpeechStream(_voiceId, {
                stripMarkdown: true, // Already stripped cleanly by `md` above
                firstChunk: 'clause',
                firstChunkMaxWords: 12,
                ...stripSettings,
                targetChars: context.appSettings.ttsTargetChars ?? 300,
                silentMode: "respect",
                onError: (err) => {
                    console.warn("TTS Stream Error:", err);
                    if (this.loading) this.loading = false;
                },
                volume: 1,
                pitch: 1,
                speed: context.appSettings.rate ?? 1,
            }));

            // Start at -1 so onIndexChanged fires on the very first spoken paragraph too
            let currentParagraphIndex = -1;
            let fullText = "";

            unsubscribe = stream.onProgress((event) => {
                const { start, end } = event.streamRange;
                if (this.loading) this.loading = false;
                const isFinalChunk = end >= fullText.length - 2;
                // Match exact character offset to rawText index
                const activeChunk = chunks.find((c) => start >= c.start && start < c.end);
                if (activeChunk && activeChunk.index !== currentParagraphIndex) {
                    currentParagraphIndex = activeChunk.index;
                    onIndexChanged?.(currentParagraphIndex, isFinalChunk);
                }

                onProgress?.(event);
            });

            // Concatenate chunk.text directly with NO extra space so offsets stay 100% aligned
            for (const chunk of chunks) {
                fullText += chunk.text;
            }

            stream.append(fullText);
            await stream.finalize();

            if (!this.isCanceled && this.currentStream == stream) {
                this.currentStream = undefined;
                this.currentPlaying = "";
                this.status = "idle";
                if (this.loading) this.loading = false;

                onDone?.();

            }
        } catch (err) {
            if (!this.isCanceled) {
                console.warn("TTS Playback Error:", err);
                await this.stop();
                this.status = "idle";
            }
        } finally {
            unsubscribe?.();
        }
    }

}
