export class PredictApiClient {
  constructor(private readonly baseUrl: string) {}

  async getOracleIds(predictId: string) {
    return this.getJson(`/predicts/${predictId}/oracles`);
  }

  async getOracleState(oracleId: string) {
    return this.getJson(`/oracles/${oracleId}/state`);
  }

  async getManagerSummary(managerId: string) {
    return this.getJson(`/managers/${managerId}/summary`);
  }

  async getManagerPositionsSummary(managerId: string) {
    return this.getJson(`/managers/${managerId}/positions/summary`);
  }

  private async getJson(path: string) {
    const response = await fetch(new URL(path, this.baseUrl));
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Predict server request failed (${response.status}): ${body}`);
    }
    return response.json();
  }
}
