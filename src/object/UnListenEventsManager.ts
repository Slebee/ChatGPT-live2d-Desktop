export class UnListenEventsManager {
  private events: Function[] = [];

  public addEvent(event: Function) {
    this.events.push(event);
  }

  public clearEvents() {
    this.events.forEach((event) => {
      event();
    });
  }
}
