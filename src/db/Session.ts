import TableNames from "./TableNames";
import { public_m } from "../Methods";
import { DBInit } from "../Types"

class Session extends DBInit {
  id: number = 0;
  data: string = "";
  date: Date = new Date();
  file: string;

  constructor() {
    super("Sessions");
  }

  config() {
    return this.TableBuilder<Session, TableNames>("Sessions")
      .column("data").encrypt("novelo.enc")
      .column("file").encrypt("novelo.enc")
      .column("date")
      .dateTime.objectPrototype(Session.prototype);
  }
}
public_m(Session);
export default Session;
