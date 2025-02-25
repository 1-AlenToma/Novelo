import 'should'
import { Functions } from '../UsefullMethods'
import BulkSave from '../BulkSave';
import QuerySelector, { IQuerySelector } from '../QuerySelector';
import { DetaliItems, Chapters, tables, TableNames } from './TestItems';


const database = {
    delete: async () => { },
    save: async () => { },
    querySelector: (tbName: TableNames) => new QuerySelector<any, TableNames>(tbName, database),
    tables: tables
} as any

const item = {
    tableName: "DetaliItems",
    id: 1,
    title: "this is a test",
    novel: "testNovel"
} as DetaliItems

test("testwhere", function () {
    console.log("testwhere")
    const q = Functions.translateSimpleSql(database, "DetaliItems", { "$in-novel": ["test", "hahaha"], title: "hey" })
    const q2 = Functions.translateSimpleSql(database, "DetaliItems", { novel: "test", title: "hey" })
    const q3 = Functions.translateSimpleSql(database, "DetaliItems");
    q.sql.should.eql("SELECT * FROM DetaliItems WHERE novel IN (?, ?) AND title=? ");
    q.args[0].should.eql("#dbEncrypted&iwx3MskszSgNcP8QDQA7Ag==");
    q.args[2].should.eql("hey")
    q2.sql.should.eql("SELECT * FROM DetaliItems WHERE novel=? AND title=? ");
    q2.args[0].should.eql("#dbEncrypted&iwx3MskszSgNcP8QDQA7Ag==");
    q2.args[1].should.eql("hey");
    q3.sql.should.eql("SELECT * FROM DetaliItems ");
});


test("testgetAvailableKeys", function () {
    const items = Functions.getAvailableKeys(["name", "id", "password"], {
        password: "test"
    })

    items.length.should.eql(1);
});

test("encryptions", function () {
    const en = Functions.encrypt("test", "123")
    const dec = Functions.decrypt(en, "123");
    dec.should.eql("test")
});

test("readEncryption", function () {
    console.log("readEncryption")
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.where.column(x => x.novel).equalTo("test").and.column(x => x.title).equalTo("hey").limit(100).orderByAsc(x => x.title)
    sql.getSql("SELECT").sql.trim().should.eql("SELECT * FROM DetaliItems WHERE novel = ? AND title = ? ORDER BY title ASC Limit 100")
    sql.getSql("SELECT").args[0].should.eql("#dbEncrypted&iwx3MskszSgNcP8QDQA7Ag==")
    sql.getSql("SELECT").args[1].should.eql("hey")
    sql.getSql("SELECT").args.length.should.eql(2)
    console.log("readEncryption", sql.getInnerSelectSql())
});

test("startWith", function () {
    console.log("startWith")
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as IQuerySelector<DetaliItems, TableNames>;
    q.where.column(x => x.novel).equalTo("test").and.column(x => x.title)
        .equalTo("hey").and
        .column(x => x.title)
        .not.startsWith(x => x.novel)
        .start.column(x => x.title).endsWith("he").end
        .limit(100).orderByAsc(x => x.title);
    const sql = q.getSql("SELECT");
    sql.sql.trim().toLowerCase().should.eql("SELECT * FROM DetaliItems WHERE novel = ? AND title = ? AND title NOT like novel + \'%\' ( title like ? ) ORDER BY title ASC Limit 100".toLowerCase())
    sql.args[0].should.eql("#dbEncrypted&iwx3MskszSgNcP8QDQA7Ag==")
    sql.args[1].should.eql("hey")
    sql.args[2].should.eql("%he")
    sql.args.length.should.eql(3)
    console.log("startWith", q.getInnerSelectSql());

});



test("bulkSaveWithEncryptionsinsert", function () {
    console.log("bulkSaveWithEncryptionsinsert")
    const b = new BulkSave<DetaliItems, TableNames>(database, ["title", "novel"], "DetaliItems").insert(item as any);
    b.quries[0].args[1].should.eql("#dbEncrypted&0eUCHRbFc8mdr94/KJYKOA==")
    b.quries[0].args[0].should.eql(item.title)
});

test("bulkSaveWithEncryptionsUpdate", function () {
    console.log("bulkSaveWithEncryptionsUpdate");
    const b = new BulkSave<DetaliItems, TableNames>(database, ["title", "novel"], "DetaliItems").update(item as any);
    b.quries[0].args[1].should.eql("#dbEncrypted&0eUCHRbFc8mdr94/KJYKOA==");
    b.quries[0].args[0].should.eql(item.title);
});

test("DeleteWthlimit", function () {
    console.log("DeleteWthlimit");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.limit(100).orderByAsc(x => x.title).getSql("DELETE")
    sql.sql.trim().toLowerCase().should.eql("DELETE FROM DetaliItems".toLowerCase())
    sql.args.length.should.eql(0)
});


test("DeleteWithSearch", function () {
    console.log("DeleteWithSearch");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = (q.where.start.column(x => x.id).equalTo(50).end.getSql("DELETE"))
    sql.sql.trim().should.eql("DELETE FROM DetaliItems WHERE ( id = ? )")
    sql.args[0].should.eql(50)
    sql.args.length.should.eql(1)
});

test("DeleteWithSearchNotin", function () {
    console.log("DeleteWithSearchNotin");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = (q.where.start.column(x => x.id).not.in([10, 2]).end.getSql("DELETE"))
    sql.sql.trim().should.eql("DELETE FROM DetaliItems WHERE ( id NOT IN( ?, ? ) )")
    sql.args[0].should.eql(10)
    sql.args[1].should.eql(2)
    sql.args.length.should.eql(2)
});

test("DeleteWithEncryptions", function () {
    console.log("DeleteWithEncryptions");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = (q.where.start.column(x => x.image).not.in([item.novel]).end.getSql("DELETE"))

    sql.sql.trim().should.eql("DELETE FROM DetaliItems WHERE ( image NOT IN( ? ) )")
    sql.args[0].should.eql("#dbEncrypted&0eUCHRbFc8mdr94/KJYKOA==")
    sql.args.length.should.eql(1)
});


test("limitTest", function () {
    console.log("limitTest");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = (q.limit(100).getSql("SELECT"));
    sql.sql.trim().should.eql("SELECT * FROM DetaliItems Limit 100")
    sql.args.length.should.eql(0)
});

test("OrderDesc", function () {
    console.log("OrderDesc");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = (q.orderByDesc(x => x.id).getSql("SELECT"))
    sql.sql.trim().should.eql("SELECT * FROM DetaliItems ORDER BY id DESC");
    sql.args.length.should.eql(0)
});

test("OrderAsc", function () {
    console.log("OrderAsc");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.orderByAsc(x => x.id).getSql("SELECT")
    sql.sql.trim().should.eql("SELECT * FROM DetaliItems ORDER BY id ASC")
    sql.args.length.should.eql(0)
});


test("wherecolumn", function () {
    console.log("wherecolumn");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = (q.where.column(x => x.title).contains("test").orderByDesc(x => x.id).getSql("SELECT"))
    sql.sql.trim().should.eql("SELECT * FROM DetaliItems WHERE title like ? ORDER BY id DESC")
    sql.args.length.should.eql(1)
    sql.args[0].should.eql("%test%")
});


test("lessString", function () {
    console.log("lessString");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.where.column(x => x.id).lessThan(15).getSql("SELECT");
    sql.sql.trim().should.eql("SELECT * FROM DetaliItems WHERE id < ?")
    sql.args[0].should.eql(15)
    sql.args.length.should.eql(1)
});

test("innerJOIN", function () {
    console.log("innerJOIN");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    q.innerJoin<Chapters, "b">("Chapters", "b").column(x => x.a.id).equalTo(x => x.b.detaliItem_Id).where.column(x => x.a.id).lessThan(15)
    const sql = q.getSql("SELECT");
    sql.sql.trim().should.eql("SELECT * FROM DetaliItems as a INNER JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < ?")
    sql.args[0].should.eql(15)
    sql.args.length.should.eql(1)
    console.log("innerJOIN", q.getInnerSelectSql())
});

test("leftJOIN", function () {
    console.log("leftJOIN");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.leftJoin<Chapters, "b">("Chapters", "b").column(x => x.a.id).equalTo(x => x.b.detaliItem_Id).where.column(x => x.a.id).lessThan(15).getSql("SELECT");
    sql.sql.trim().should.eql("SELECT * FROM DetaliItems as a LEFT JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < ?")
    sql.args[0].should.eql(15)
    sql.args.length.should.eql(1)
    console.log("leftJOIN", q.getInnerSelectSql())
});


test("having", function () {
    console.log("having");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.leftJoin<Chapters, "b">("Chapters", "b")
        .column(x => x.a.id)
        .equalTo(x => x.b.detaliItem_Id)
        .where
        .column(x => x.a.id)
        .lessThan(15)
        .select.columns((x, as) => [as(x.a.title, "setoNaming")])
        .count(x => x.b.chapterUrl, "sName")
        .having
        .groupBy(x => x.a.id).column("sName")
        .greaterThan(4).orderByAsc(x => x.a.title).orderByDesc(x => [x.a.id, x.b.chapterUrl])
        .getSql("SELECT");
    sql.sql.trim().should.eql("SELECT a.title as setoNaming , count(b.chapterUrl) as sName FROM DetaliItems as a LEFT JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < ? GROUP BY a.id HAVING sName > ? ORDER BY a.title ASC, a.id DESC, b.chapterUrl DESC")
    sql.args[0].should.eql(15)
    sql.args[1].should.eql(4)
    sql.args.length.should.eql(2)
    console.log("having", q.getInnerSelectSql())
});

test("SimpleSql", function () {
    console.log("SimpleSql");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.leftJoin<Chapters, "b">("Chapters", "b")
        .column(x => x.a.id)
        .equalTo(x => x.b.detaliItem_Id)
        .where
        .column(x => x.a.id)
        .lessThan(15).and.column(x => x.a.title).not.startsWith("?")
        .select.columns((x, as) => [as(x.a.title, "setoNaming")])
        .count(x => x.b.chapterUrl, "sName")
        .having
        .groupBy(x => x.a.id).column("sName")
        .greaterThan(4).orderByAsc(x => x.a.title).orderByDesc(x => [x.a.id, x.b.chapterUrl])
        .getInnerSelectSql()
    sql.trim().should.eql("SELECT a.title as setoNaming , count(b.chapterUrl) as sName FROM DetaliItems as a LEFT JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < 15 AND a.title NOT like \'?%\' GROUP BY a.id HAVING sName > 4 ORDER BY a.title ASC, a.id DESC, b.chapterUrl DESC")
    console.log("SimpleSql", q.getInnerSelectSql())
});

test("innerSelect", function () {
    console.log("innerSelect");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    var q2 = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.leftJoin<Chapters, "b">("Chapters", "b")
        .column(x => x.a.id)
        .equalTo(x => x.b.detaliItem_Id)
        .where
        .column(x => x.a.id)
        .lessThan(15).and.column(x => x.a.title).not.startsWith("?").and.column(x => x.a.novel).not.in(q2.where.column(x => x.id).greaterThan(1).select.columns(x => [x.novel]))
        .select.columns((x, as) => [as(x.a.title, "setoNaming")])
        .count(x => x.b.chapterUrl, "sName")
        .having
        .groupBy(x => x.a.id).column("sName")
        .greaterThan(4).orderByAsc(x => x.a.title).orderByDesc(x => [x.a.id, x.b.chapterUrl])
        .getInnerSelectSql()
    sql.trim().should.eql("SELECT a.title as setoNaming , count(b.chapterUrl) as sName FROM DetaliItems as a LEFT JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < 15 AND a.title NOT like \'?%\' AND a.novel NOT IN( SELECT novel FROM DetaliItems WHERE id > 1 ) GROUP BY a.id HAVING sName > 4 ORDER BY a.title ASC, a.id DESC, b.chapterUrl DESC")
    console.log("innerSelect", q.getInnerSelectSql())
});

test("JOIN", function () {
    console.log("JOIN");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    var q2 = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.join<Chapters, "b">("Chapters", "b")
        .column(x => x.a.id)
        .equalTo(x => x.b.detaliItem_Id)
        .where
        .column(x => x.a.id)
        .lessThan(15).and.column(x => x.a.title).not.startsWith("?").and.column(x => x.a.novel).not.in(q2.where.column(x => x.id).greaterThan(1).select.columns(x => [x.novel]))
        .select.columns((x, as) => [as(x.a.title, "setoNaming")])
        .count(x => x.b.chapterUrl, "sName")
        .having
        .groupBy(x => x.a.id).column("sName")
        .greaterThan(4).orderByAsc(x => x.a.title).orderByDesc(x => [x.a.id, x.b.chapterUrl])
        .getInnerSelectSql()
    sql.trim().should.eql("SELECT a.title as setoNaming , count(b.chapterUrl) as sName FROM DetaliItems as a JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < 15 AND a.title NOT like \'?%\' AND a.novel NOT IN( SELECT novel FROM DetaliItems WHERE id > 1 ) GROUP BY a.id HAVING sName > 4 ORDER BY a.title ASC, a.id DESC, b.chapterUrl DESC")
    console.log("JOIN", q.getInnerSelectSql())
});


test("crossJOIN", function () {
    console.log("crossJOIN");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    var q2 = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.crossJoin<Chapters, "b">("Chapters", "b")
        .column(x => x.a.id)
        .equalTo(x => x.b.detaliItem_Id)
        .where
        .column(x => x.a.id)
        .lessThan(15).and.column(x => x.a.title).not.startsWith("?").and.column(x => x.a.novel).not.in(q2.where.column(x => x.id).greaterThan(1).select.columns(x => [x.novel]))
        .select.columns((x, as) => [as(x.a.title, "setoNaming")])
        .count(x => x.b.chapterUrl, "sName")
        .having
        .groupBy(x => x.a.id).column("sName")
        .greaterThan(4).orderByAsc(x => x.a.title).orderByDesc(x => [x.a.id, x.b.chapterUrl])
        .getInnerSelectSql()
    sql.trim().should.eql("SELECT a.title as setoNaming , count(b.chapterUrl) as sName FROM DetaliItems as a CROSS JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < 15 AND a.title NOT like \'?%\' AND a.novel NOT IN( SELECT novel FROM DetaliItems WHERE id > 1 ) GROUP BY a.id HAVING sName > 4 ORDER BY a.title ASC, a.id DESC, b.chapterUrl DESC")
    console.log("crossJOIN", q.getInnerSelectSql())
});

test("EmptyJOIN", function () {
    console.log("EmptyJOIN");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    var q2 = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.join<Chapters, "b">("Chapters", "b")
        .where
        .column(x => x.a.id)
        .lessThan(15).and.column(x => x.a.title).not.startsWith("?").and.column(x => x.a.novel).not.in(q2.where.column(x => x.id).greaterThan(1).select.columns(x => [x.novel]))
        .select.columns((x, as) => [as(x.a.title, "setoNaming")])
        .count(x => x.b.chapterUrl, "sName")
        .having
        .groupBy(x => x.a.id).column("sName")
        .greaterThan(4).orderByAsc(x => x.a.title).orderByDesc(x => [x.a.id, x.b.chapterUrl])
        .getInnerSelectSql()
    sql.trim().should.eql("SELECT a.title as setoNaming , count(b.chapterUrl) as sName FROM DetaliItems as a JOIN Chapters as b WHERE a.id < 15 AND a.title NOT like \'?%\' AND a.novel NOT IN( SELECT novel FROM DetaliItems WHERE id > 1 ) GROUP BY a.id HAVING sName > 4 ORDER BY a.title ASC, a.id DESC, b.chapterUrl DESC")
    console.log("EmptyJOIN", q.getInnerSelectSql())
});

test("ValueandBetWeen", function () {
    console.log("ValueandBetWeen");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    var q2 = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.leftJoin<Chapters, "b">("Chapters", "b")
        .column(x => x.a.id)
        .equalTo(x => x.b.detaliItem_Id)
        .where
        .column(x => x.a.id)
        .lessThan(15).and.column(x => x.a.title).not.startsWith("?").and.column(x => x.a.novel).not.in(q2.where.column(x => x.id).greaterThan(1).select.columns(x => [x.novel]))
        .select.columns((x, as) => [as(x.a.title, "setoNaming")])
        .count(x => x.b.chapterUrl, "sName")
        .having
        .groupBy(x => x.a.id).column("sName")
        .greaterThan(4).and.column(x => x.a.id).between(2, 5).orderByAsc(x => x.a.title).orderByDesc(x => [x.a.id, x.b.chapterUrl])
        .getInnerSelectSql()
    sql.trim().should.eql("SELECT a.title as setoNaming , count(b.chapterUrl) as sName FROM DetaliItems as a LEFT JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < 15 AND a.title NOT like \'?%\' AND a.novel NOT IN( SELECT novel FROM DetaliItems WHERE id > 1 ) GROUP BY a.id HAVING sName > 4 AND a.id BETWEEN 2 AND 5 ORDER BY a.title ASC, a.id DESC, b.chapterUrl DESC")
    console.log("ValueandBetWeen", q.getInnerSelectSql())
});


test("Aggrigators", function () {
    console.log("Aggrigators");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    var q2 = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.leftJoin<Chapters, "b">("Chapters", "b")
        .column(x => x.a.id)
        .equalTo(x => x.b.detaliItem_Id)
        .where
        .column(x => x.a.id)
        .lessThan(15).and.start.concat("||", x => x.a.title, "-", x => x.a.id).end.endsWith("1").and.column(x => x.a.title).not.startsWith("?").and.column(x => x.a.novel).not.in(q2.where.column(x => x.id).greaterThan(1).select.columns(x => [x.novel]))
        .select.columns((x, as) => [as(x.a.title, "setoNaming")])
        .count(x => "*", "sName").sum(x => x.a.id, "s").concat("NameandId", "||", x => x.a.title, "-", x => x.a.id)
        .having
        .groupBy(x => x.a.id).column("sName")
        .greaterThan(4).and.column(x => x.a.id).between(2, 5).orderByAsc(x => x.a.title).orderByDesc(x => [x.a.id, x.b.chapterUrl])
        .getInnerSelectSql()
    sql.trim().should.eql("SELECT a.title as setoNaming , count(*) as sName , sum(a.id) as s , a.title || \'-\' || a.id as NameandId FROM DetaliItems as a LEFT JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < 15 AND ( a.title || \'-\' || a.id ) like \'%1\' AND a.title NOT like \'?%\' AND a.novel NOT IN( SELECT novel FROM DetaliItems WHERE id > 1 ) GROUP BY a.id HAVING sName > 4 AND a.id BETWEEN 2 AND 5 ORDER BY a.title ASC, a.id DESC, b.chapterUrl DESC")
    console.log("Aggrigators", q.getInnerSelectSql())
});


test("Union", function () {
    console.log("Union");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    var q2 = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.leftJoin<Chapters, "b">("Chapters", "b")
        .column(x => x.a.id)
        .equalTo(x => x.b.detaliItem_Id)
        .union(x => x.querySelector<Chapters>("Chapters").where.column(x => x.id).greaterThan(1).and.column(x => x.chapterUrl).not.startsWith("t").select.columns(x => [x.chapterUrl]))
        .where
        .column(x => x.a.id)
        .lessThan(15).and.start.concat("||", x => x.a.title, "-", x => x.a.id).end.endsWith("1").and.column(x => x.a.title).not.startsWith("?").and.column(x => x.a.novel).not.in(q2.where.column(x => x.id).greaterThan(1).select.columns(x => [x.novel]))
        .select.columns((x, as) => [as(x.a.title, "setoNaming")])
        .getInnerSelectSql()
    sql.trim().should.eql("SELECT a.title as setoNaming FROM DetaliItems as a LEFT JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < 15 AND ( a.title || \'-\' || a.id ) like \'%1\' AND a.title NOT like \'?%\' AND a.novel NOT IN( SELECT novel FROM DetaliItems WHERE id > 1 ) UNION SELECT chapterUrl FROM Chapters WHERE id > 1 AND chapterUrl NOT like \'#dbEncrypted&JY+5fBsP75gn/K/VA1KFkQ==%\'")
    console.log("Union", q.getInnerSelectSql())
});

test("UnionAll", function () {
    console.log("UnionAll");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    var q2 = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.leftJoin<Chapters, "b">("Chapters", "b")
        .column(x => x.a.id)
        .equalTo(x => x.b.detaliItem_Id)
        .unionAll(x => x.querySelector<Chapters>("Chapters").where.column(x => x.id).greaterThan(1).and.column(x => x.chapterUrl).not.startsWith("t").select.columns(x => [x.chapterUrl]))
        .where
        .column(x => x.a.id)
        .lessThan(15).and.start.concat("||", x => x.a.title, "-", x => x.a.id).end.endsWith("1").and.column(x => x.a.title).not.startsWith("?").and.column(x => x.a.novel).not.in(q2.where.column(x => x.id).greaterThan(1).select.columns(x => [x.novel]))
        .select.columns((x, as) => [as(x.a.title, "setoNaming")])
        .getInnerSelectSql()
    sql.trim().should.eql("SELECT a.title as setoNaming FROM DetaliItems as a LEFT JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE a.id < 15 AND ( a.title || \'-\' || a.id ) like \'%1\' AND a.title NOT like \'?%\' AND a.novel NOT IN( SELECT novel FROM DetaliItems WHERE id > 1 ) UNION ALL SELECT chapterUrl FROM Chapters WHERE id > 1 AND chapterUrl NOT like \'#dbEncrypted&JY+5fBsP75gn/K/VA1KFkQ==%\'")
    console.log("Union", q.getInnerSelectSql())
});

test("Select case", function () {
    console.log("Select case");
    var q = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    var q2 = new QuerySelector<DetaliItems, TableNames>("DetaliItems", database) as any as IQuerySelector<DetaliItems, TableNames>;
    const sql = q.leftJoin<Chapters, "b">("Chapters", "b")
        .column(x => x.a.id)
        .equalTo(x => x.b.detaliItem_Id)
        .where.case.when.column(x => x.a.id).equalTo(2).then.value("hahaha").else.value("hohoho").endCase.not.in(["hohoho"]).and
        .column(x => x.a.id)
        .lessThan(15).and.start.concat("||", x => x.a.title, "-", x => x.a.id).end.endsWith("1").and.column(x => x.a.title).not.startsWith("?").and.column(x => x.a.novel).not.in(q2.where.column(x => x.id).greaterThan(1).select.columns(x => [x.novel]))
        .select.columns((x, as) => [as(x.a.title, "setoNaming")]).case("test").when.column(x => x.a.id).equalTo(2).then.value("hahaha").else.value("hohoho").endCase
        .getInnerSelectSql()
    sql.trim().should.eql("SELECT a.title as setoNaming , (  CASE WHEN a.id = 2 THEN \'hahaha\' ELSE \'hohoho\' END ) as test FROM DetaliItems as a LEFT JOIN Chapters as b ON  a.id = b.detaliItem_Id WHERE CASE WHEN a.id = 2 THEN \'hahaha\' ELSE \'hohoho\' END NOT IN( \'hohoho\' ) AND a.id < 15 AND ( a.title || \'-\' || a.id ) like \'%1\' AND a.title NOT like \'?%\' AND a.novel NOT IN( SELECT novel FROM DetaliItems WHERE id > 1 )")
    console.log("Select case", q.getInnerSelectSql())
});