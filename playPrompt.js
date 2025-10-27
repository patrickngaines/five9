/**
 * Five9 Auto Skill Prompt by Call Type
 * Purpose: Automatically play a Five9-hosted Skill prompt when a call connects (TALKING state),
 *          but only for specific call types.
 *
 * Usage:
 * 1. Host this file publicly (GitHub Pages, jsDelivr, etc.).
 * 2. Reference its URL in Five9 Admin → Agent Desktop → Desktop Toolkit → Customization → JavaScript URL.
 */

(function() {
  console.log("Five9 Auto Skill Prompt by Call Type loaded...");

  // === CONFIGURATION SECTION ===
  const promptName = "UTILITY_QADisclosure";  // Replace with your actual VCC prompt name
  const allowedCallTypes = [           // Only play for these call types
    "INBOUND",                         // Uncomment to include inbound calls
    "OUTBOUND",                        // Uncomment to include outbound campaign calls
    "MANUAL",                          // Uncomment for manual calls
    "PREVIEW"                          // Uncomment for preview dial calls
  ];
  // ==============================

  function waitForFive9Sdk(callback) {
    if (window.Five9 && window.Five9.CrmSdk) {
      callback(window.Five9.CrmSdk);
    } else {
      setTimeout(() => waitForFive9Sdk(callback), 1000);
    }
  }

  waitForFive9Sdk(function(CrmSdk) {
    console.log("Five9 CRM SDK detected. Initializing Auto Prompt...");

    const interactionApi = CrmSdk.interactionApi();

    interactionApi.registerInteractionApi({
      interactionStateChanged: function(params) {
        if (!params || !params.newState) return;

        const { newState, interactionData } = params;
        const callType = interactionData?.callType || "UNKNOWN";

        console.log(`State changed → ${newState} | CallType: ${callType}`);

        // Only proceed when call connects and is an allowed type
        if (newState === "TALKING" && allowedCallTypes.includes(callType)) {
          console.log(`Call type "${callType}" matched allowed list — playing prompt "${promptName}"`);

          interactionApi.executeAction({
            action: "playPrompt",
            parameters: { promptName: promptName }
          })
          .then(result => {
            console.log("Prompt playback initiated:", result);
          })
          .catch(err => {
            console.error("Error playing Skill prompt:", err);
          });
        } else if (newState === "TALKING") {
          console.log(`Call type "${callType}" not in allowed list — skipping prompt.`);
        }
      }
    });

    console.log("Five9 Auto Prompt by Call Type initialized successfully.");
  });
})();
