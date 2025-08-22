// ユーザーのパラメータを保持するインターフェース
interface User {
  weightKg: number;
  ageYears: number;
  geneType: 'fast' | 'normal' | 'slow';
  isSmoker: boolean;
  isOnMeds: boolean;
}

interface IntakeEvent {
  timeUnix: number;
  caffeineMg: number;
}

/**
 * ユーザーのパラメータに基づいて調整された半減期（分）を計算
 */
function getAdjustedHalfLife(user: User): number {
  let baseHalfLife: number;
  if (user.ageYears <= 20) {
    baseHalfLife = 240.0;
  } else if (user.ageYears <= 40) {
    baseHalfLife = 300.0;
  } else if (user.ageYears <= 60) {
    baseHalfLife = 360.0;
  } else if (user.ageYears <= 75) {
    baseHalfLife = 420.0;
  } else {
    baseHalfLife = 480.0;
  }

  let geneFactor: number;
  if (user.geneType === 'fast') {
    geneFactor = 0.7;
  } else if (user.geneType === 'slow') {
    geneFactor = 1.5;
  } else {
    geneFactor = 1.0;
  }

  const smokerFactor = user.isSmoker ? 0.6 : 1.0;
  const medicationFactor = user.isOnMeds ? 1.5 : 1.0;

  return baseHalfLife * geneFactor * smokerFactor * medicationFactor;
}

function calculateConcentration(
  currentTime: Date,
  intakeHistory: IntakeEvent[],
  user: User,
): number {
  const adjustedHalfLife = getAdjustedHalfLife(user);
  const k = Math.log(2) / adjustedHalfLife;
  const ka = 0.05; // NOTE: 吸収速度定数
  const f = 1.0; // NOTE: バイオアベイラビリティ

  let totalConcentration = 0.0;
  for (const event of intakeHistory) {
    const intakeTime = new Date(event.timeUnix * 1000);
    if (currentTime.getTime() >= intakeTime.getTime()) {
      const elapsedTime =
        (currentTime.getTime() - intakeTime.getTime()) / (1000 * 60);

      // NOTE: 二重指数関数モデル
      const concentrationAtT =
        ((f * ka * event.caffeineMg) / (user.weightKg * (ka - k))) *
        (Math.exp(-k * elapsedTime) - Math.exp(-ka * elapsedTime));

      totalConcentration += concentrationAtT;
    }
  }

  return totalConcentration;
}

/**
 * 指定した時間後のカフェイン濃度を計算する関数
 * @param hoursLater 何時間後かを指定（小数も可能）
 * @param intakeHistory カフェイン摂取履歴
 * @param user ユーザー情報
 * @returns カフェイン濃度 (mg/kg)
 */
function calculateConcentrationAfterHours(
  hoursLater: number,
  intakeHistory: IntakeEvent[],
  user: User,
): number {
  const now = new Date();
  const targetTime = new Date(now.getTime() + hoursLater * 60 * 60 * 1000);
  return calculateConcentration(targetTime, intakeHistory, user);
}

/**
 * カフェイン摂取を30分間で10回に分割して段階的な摂取イベントを生成
 * @param startTimeUnix 摂取開始時刻（Unix時刻秒）
 * @param totalCaffeineMg 総カフェイン量（mg）
 * @returns 3分間隔で10回の摂取イベント配列
 */
function createGradualIntakeEvents(
  startTimeUnix: number,
  totalCaffeineMg: number,
): IntakeEvent[] {
  const events: IntakeEvent[] = [];
  const intervalMinutes = 3; // 3分間隔
  const numberOfEvents = 10; // 10回に分割
  const caffeinePerEvent = totalCaffeineMg / numberOfEvents; // 1回あたりのカフェイン量

  for (let i = 0; i < numberOfEvents; i++) {
    const eventTime = startTimeUnix + i * intervalMinutes * 60; // 3分ごと
    events.push({
      timeUnix: eventTime,
      caffeineMg: caffeinePerEvent,
    });
  }

  return events;
}

/**
 * カフェイン濃度の重要なポイントを分析する関数
 * @param intakeHistory カフェイン摂取履歴
 * @param user ユーザー情報
 * @param analysisHours 分析する時間範囲（時間）
 * @returns 分析結果
 */
function analyzeCaffeineConcentration(
  intakeHistory: IntakeEvent[],
  user: User,
  analysisHours: number = 24,
): {
  maxConcentration: { value: number; timeHours: number; dateTime: Date };
  above2mgkgPeriods: Array<{ startTime: Date; endTime: Date | null }>;
  above3_5mgkgPeriods: Array<{ startTime: Date; endTime: Date | null }>;
  below1mgkg: { time: Date | null };
} {
  const now = new Date();
  const intervalMinutes = 1; // 1分間隔で詳細分析
  let maxConcentration = { value: 0, timeHours: 0, dateTime: now };

  const above2mgkgPeriods: Array<{
    startTime: Date;
    endTime: Date | null;
  }> = [];
  const above3_5mgkgPeriods: Array<{
    startTime: Date;
    endTime: Date | null;
  }> = [];
  let below1mgkgTime: Date | null = null;

  let wasAbove2mgkg = false;
  let currentPeriodStart2mgkg: Date | null = null;

  let wasAbove3_5mgkg = false;
  let currentPeriodStart3_5mgkg: Date | null = null;

  // 指定時間範囲を1分間隔で分析
  for (
    let minutes = 0;
    minutes <= analysisHours * 60;
    minutes += intervalMinutes
  ) {
    const hoursLater = minutes / 60;
    const currentTime = new Date(now.getTime() + minutes * 60 * 1000);
    const concentration = calculateConcentrationAfterHours(
      hoursLater,
      intakeHistory,
      user,
    );

    // 最大濃度の更新
    if (concentration > maxConcentration.value) {
      maxConcentration = {
        value: concentration,
        timeHours: hoursLater,
        dateTime: currentTime,
      };
    }

    // 2mg/kg閾値の分析（すべての期間を記録）
    if (concentration >= 2.0) {
      if (!wasAbove2mgkg) {
        // 新しい2mg/kg超過期間の開始
        currentPeriodStart2mgkg = currentTime;
        wasAbove2mgkg = true;
      }
    } else {
      if (wasAbove2mgkg && currentPeriodStart2mgkg) {
        // 2mg/kg未満になったので期間終了
        above2mgkgPeriods.push({
          startTime: currentPeriodStart2mgkg,
          endTime: currentTime,
        });
        wasAbove2mgkg = false;
        currentPeriodStart2mgkg = null;
      }
    }

    // 3.5mg/kg警戒域の分析（すべての期間を記録）
    if (concentration >= 3.5) {
      if (!wasAbove3_5mgkg) {
        // 新しい3.5mg/kg超過期間の開始
        currentPeriodStart3_5mgkg = currentTime;
        wasAbove3_5mgkg = true;
      }
    } else {
      if (wasAbove3_5mgkg && currentPeriodStart3_5mgkg) {
        // 3.5mg/kg未満になったので期間終了
        above3_5mgkgPeriods.push({
          startTime: currentPeriodStart3_5mgkg,
          endTime: currentTime,
        });
        wasAbove3_5mgkg = false;
        currentPeriodStart3_5mgkg = null;
      }
    }

    // 1mg/kg閾値の分析（初回のみ）
    if (concentration < 1.0 && below1mgkgTime === null && hoursLater > 0.5) {
      // 0.5時間後以降で初めて1mg/kgを下回った時点
      below1mgkgTime = currentTime;
    }
  }

  // 分析終了時に2mg/kg以上の状態が続いている場合
  if (wasAbove2mgkg && currentPeriodStart2mgkg) {
    above2mgkgPeriods.push({
      startTime: currentPeriodStart2mgkg,
      endTime: null, // 分析期間中は継続
    });
  }

  // 分析終了時に3.5mg/kg以上の状態が続いている場合
  if (wasAbove3_5mgkg && currentPeriodStart3_5mgkg) {
    above3_5mgkgPeriods.push({
      startTime: currentPeriodStart3_5mgkg,
      endTime: null, // 分析期間中は継続
    });
  }

  return {
    maxConcentration,
    above2mgkgPeriods,
    above3_5mgkgPeriods,
    below1mgkg: { time: below1mgkgTime },
  };
}

/**
 * カフェイン濃度分析結果を出力する関数
 * @param intakeHistory カフェイン摂取履歴
 * @param user ユーザー情報
 * @param drinkNumber 何杯目か
 */
function printCaffeineAnalysis(
  intakeHistory: IntakeEvent[],
  user: User,
  drinkNumber: number,
): void {
  const adjustedHalfLife = getAdjustedHalfLife(user);
  const analysis = analyzeCaffeineConcentration(intakeHistory, user, 15);

  console.log(`\n=== ${drinkNumber}杯目摂取完了後の分析 ===`);
  console.log(
    `調整済み半減期: ${adjustedHalfLife.toFixed(1)}分 (${(adjustedHalfLife / 60).toFixed(1)}時間)`,
  );

  console.log('\n【最大濃度】');
  console.log(`濃度: ${analysis.maxConcentration.value.toFixed(3)} mg/kg`);
  console.log(`時間: ${analysis.maxConcentration.timeHours.toFixed(2)}時間後`);
  console.log(
    `日時: ${analysis.maxConcentration.dateTime.toLocaleString('ja-JP')}`,
  );

  console.log('\n【2mg/kg閾値】');
  if (analysis.above2mgkgPeriods.length === 0) {
    console.log('2mg/kgを超えることはありませんでした');
  } else {
    console.log(`2mg/kg超過期間数: ${analysis.above2mgkgPeriods.length}回`);
    analysis.above2mgkgPeriods.forEach((period, index) => {
      console.log(`\n期間${index + 1}:`);
      console.log(`  開始: ${period.startTime.toLocaleString('ja-JP')}`);
      if (period.endTime) {
        console.log(` 半減期: ${period.endTime.toLocaleString('ja-JP')}`);
        const durationMinutes = Math.round(
          (period.endTime.getTime() - period.startTime.getTime()) / (1000 * 60),
        );
        console.log(
          `  持続時間: ${Math.floor(durationMinutes / 60)}時間${durationMinutes % 60}分`,
        );
      } else {
        console.log('  半減期: 分析期間中は継続');
      }
    });
  }

  console.log('\n【3.5mg/kg警戒域】⚠️');
  if (analysis.above3_5mgkgPeriods.length === 0) {
    console.log('警戒域（3.5mg/kg）に達することはありませんでした');
  } else {
    console.log(
      `⚠️ 警戒域超過期間数: ${analysis.above3_5mgkgPeriods.length}回`,
    );
    analysis.above3_5mgkgPeriods.forEach((period, index) => {
      console.log(`\n⚠️ 警戒期間${index + 1}:`);
      console.log(`  開始: ${period.startTime.toLocaleString('ja-JP')}`);
      if (period.endTime) {
        console.log(`  終了: ${period.endTime.toLocaleString('ja-JP')}`);
        const durationMinutes = Math.round(
          (period.endTime.getTime() - period.startTime.getTime()) / (1000 * 60),
        );
        console.log(
          `  持続時間: ${Math.floor(durationMinutes / 60)}時間${durationMinutes % 60}分`,
        );
      } else {
        console.log('  半減期: 分析期間中は継続');
      }
    });
    console.log('\n🚨 注意: 3.5mg/kg以上は副作用リスクが高い領域です');
  }

  console.log('\n【1mg/kg閾値】');
  if (analysis.below1mgkg.time) {
    console.log(
      `1mg/kg未満になる: ${analysis.below1mgkg.time.toLocaleString('ja-JP')}`,
    );
  } else {
    console.log('分析期間中は1mg/kg以上を維持');
  }
}

// === 使用例 ===

const user: User = {
  weightKg: 52.0,
  ageYears: 21,
  geneType: 'normal',
  isSmoker: false,
  isOnMeds: false,
};

const now = new Date();

// 段階的な摂取イベントを生成（30分間で10回に分割）
const firstDrinkEvents = createGradualIntakeEvents(
  now.getTime() / 1000,
  142.0, // 142mgのカフェインを30分で分割摂取
);

console.log('🔍 1杯目の摂取イベント開始...');
console.log(`摂取開始時刻: ${new Date(now.getTime()).toLocaleString('ja-JP')}`);
console.log(
  `摂取完了時刻: ${new Date(now.getTime() + 27 * 60 * 1000).toLocaleString('ja-JP')}`,
);

// 1杯目摂取完了後の分析
printCaffeineAnalysis(firstDrinkEvents, user, 1);

const secondDrinkEvents = createGradualIntakeEvents(
  now.getTime() / 1000 + 300 * 60, // 5時間後に2回目の摂取開始
  142.0, // 142mgのカフェインを30分で分割摂取
);

console.log('\n🔍 2杯目の摂取イベント開始...');
console.log(
  `摂取開始時刻: ${new Date(now.getTime() + 300 * 60 * 1000).toLocaleString('ja-JP')}`,
);
console.log(
  `摂取完了時刻: ${new Date(now.getTime() + (300 + 27) * 60 * 1000).toLocaleString('ja-JP')}`,
);

// 全ての摂取イベントを結合
const allIntakeHistory: IntakeEvent[] = [
  ...firstDrinkEvents,
  ...secondDrinkEvents,
];

// 2杯目摂取完了後の分析（累積効果）
printCaffeineAnalysis(allIntakeHistory, user, 2);

// NOTE: 15分刻みで様々な時間後の濃度を計算
const timePoints: number[] = [];
for (let hour = 0; hour <= 12; hour += 0.5) {
  timePoints.push(hour);
}

console.log('\n📊 カフェイン濃度の時間推移（15分刻み）:');
for (const hours of timePoints) {
  const concentration = calculateConcentrationAfterHours(
    hours,
    allIntakeHistory,
    user,
  );
  console.log(`${hours}時間後: ${concentration.toFixed(3)} mg/kg`);
}

// 特定の時間を指定して計算
console.log('\n📈 特定時間の濃度計算:');
const specificHours = [1.5, 3.5, 6.5, 10.5, 12.5, 15.5, 18]; // 1.5時間後、3.5時間後、10.5時間後など
for (const hours of specificHours) {
  const concentration = calculateConcentrationAfterHours(
    hours,
    allIntakeHistory,
    user,
  );
  console.log(`${hours}時間後: ${concentration.toFixed(2)} mg/kg`);
}
