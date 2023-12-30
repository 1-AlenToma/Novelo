import { public_m } from "..Methods";
import HttpHandler from "./HttpHandler"
class ChapterInfo {
	name: string = "";
	url: string = "";
}

public_m(ChapterInfo);

class LightInfo extends ChapterInfo {
	decription: string = "";
	image: string = "";
	info: string = "";
}
public_m(LightInfo);

class DetailInfo extends LightInfo {
	rating: string = "";
	alternativeNames: string[] = [];
	genre: string[] = [];
	author: string = "";
	status: string = "";
	chapters: ChapterInfo[] = [];
}
public_m(DetailInfo);

class Value {
	text: string = "";
	value: any = "";
}

public_m(Value);

class ParserDetail {
	genre: Value[] = [];
	status: Value[] = [];
	group: Value[] = [];
	searchEnabled: boolean = true;
}
public_m(ParserDetail);
class SearchDetail {
	text: string = "";
	page: number = 1;
	genre: string = "";
	status: string = "";
	group: string = "";
}

public_m(SearchDetail);

abstract class Parser {
	url: string;
	http: HttpHandler;
	name: string;
	icon: string;
	settings: ParserDetail;
	constructor(url: string, name: string, icon: string) {
		this.url = url;
		this.http = new HttpHandler();
		this.name = name;
		this.icon = url.join(icon);
		this.settings = new ParserDetail();
	}

	abstract async search(options: SearchDetail): Promise<LightInfo[]>;

	abstract async detail(url: string): Promise<DetailInfo>;

	abstract async load(): Promise<ParserDetail>;

	abstract async group(value: Value, page: number): Promise<LightInfo[]>;

	abstract async chapter(url: string): Promise<string>;
}

export {
	LightInfo,
	ChapterInfo,
	DetailInfo,
	Value,
	ParserDetail,
	SearchDetail,
	Parser
};