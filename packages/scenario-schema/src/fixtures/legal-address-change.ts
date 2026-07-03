// Typed loosely (not as `Scenario`) since this fixture doubles as raw,
// occasionally-mutated-into-invalid JSON in scenario.test.ts.
export const legalAddressChangeScenario: Record<string, any> = {
  trainer_id: "legal-address-change-v1",
  title: "Смена юридического адреса клиента",
  language: "ru",
  scorm_version: "1.2",
  passing_score: 80,
  screens: [
    {
      screen_id: "screen_search",
      image: "assets/screen_1.png",
      hotspots: [
        {
          hotspot_id: "input_code",
          type: "input",
          region: { x: 0.32, y: 0.28, width: 0.4, height: 0.06 },
          expected_value: { match: "regex", pattern: "^KZ-\\d{7}$" },
          on_success: { next_screen: "screen_client_card", score: 10 },
          on_error: { hint: "Введите код в формате KZ-XXXXXXX", retry: true },
        },
      ],
    },
    {
      screen_id: "screen_client_card",
      image: "assets/screen_2.png",
      hotspots: [
        {
          hotspot_id: "edit_address_button",
          type: "click",
          region: { x: 0.6, y: 0.15, width: 0.15, height: 0.05 },
          on_success: { next_screen: null, score: 10 },
          on_error: { hint: "Нажмите на кнопку «Изменить адрес»", retry: true },
        },
      ],
    },
  ],
};
