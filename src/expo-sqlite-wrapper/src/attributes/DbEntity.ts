export function DbEntity(ctr: Function) {
    ctr.prototype.id = Math.random();
    ctr.prototype.created = new Date().toLocaleString("es-ES");
}