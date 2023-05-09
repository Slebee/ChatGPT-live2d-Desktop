import { Mission } from './Mission';

export class MissionManager {
  missions: Mission[] = [];

  constructor() {
    this.missions = [];
  }

  addMission(mission: Mission) {
    // check if mission already exists
    for (const m of this.missions) {
      if (m.getName() === mission.getName()) {
        return;
      }
    }

    this.missions.push(mission);
  }

  removeMission(mission: Mission) {
    this.missions = this.missions.filter((m) => m !== mission);
  }

  getMissions() {
    return this.missions;
  }
}
