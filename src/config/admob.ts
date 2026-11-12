// src/config/admob.ts

export const ADMOB_CONFIG = {
  // ⚠️ TESTING MODE: Jab tak app develop kar raha hai "TEST" rakhna hai.
  // Play Store par daalne se pehle isko "PRODUCTION" kar dena.
  mode: "TEST" as "TEST" | "PRODUCTION",

  // Android App ID
  appId: "ca-app-pub-6585633621662004~5485948664",

  // Ad Unit IDs (Test ID vs Real ID)
  testAdUnitId: "ca-app-pub-3940256099942544/5224354917", // Google Official Test Ad ID
  productionAdUnitId: "ca-app-pub-6585633621662004/9030442003", // Tera Real Ad ID

  get rewardedAdUnitId(): string {
    return this.mode === "PRODUCTION" ? this.productionAdUnitId : this.testAdUnitId;
  }
};
