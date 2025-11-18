/**
 * Five9 Auto Skill Prompt by Call Type (Debug Logging)
 * Purpose: Automatically play a Five9 VCC Skill prompt when a call connects,
 *          but only for allowed call types. Includes enhanced logging for debugging.
 *
 * Usage:
 *  - Host this file publicly (e.g. jsDelivr, GitHub Pages).
 *  - Reference the URL in Five9 Admin → Agent Desktop → Desktop Toolkit → Customization → JavaScript URL.
 */

(function() {
  console.log("📞 Five9 Auto Skill Prompt by Call Type (Debug) loaded...");

  // === CONFIGURATION SECTION ===
  const promptName = "UTILITY_QADisclosure";  // Replace with your actual prompt name in Five9
  const allowedCallTypes = [           // Call types that should trigger the prompt
    "INBOUND",
    "OUTBOUND",
    "MANUAL",
    "PREVIEW"
  ];
  const enableVerboseLogging = true;   // Set to false to reduce console output
  // ==============================

  function waitForFive9Sdk(callback) {
    if (window.Five9 && window.Five9.CrmSdk) {
      callback(window.Five9.CrmSdk);
    } else {
      console.log("⏳ Waiting for Five9.CrmSdk...");
      setTimeout(() => waitForFive9Sdk(callback), 1000);
    }
  }

  waitForFive9Sdk(function(CrmSdk) {
    console.log("✅ Five9 CRM SDK detected — initializing Auto Prompt logic.");

    const interactionApi = CrmSdk.interactionApi();

    interactionApi.registerInteractionApi({
      interactionStateChanged: function(params) {
        if (!params || !params.newState) return;

        const { newState, interactionData } = params;
        const callType = interactionData?.callType || "UNKNOWN";
        const skill = interactionData?.skillName || "N/A";
        const campaign = interactionData?.campaignName || "N/A";

        if (enableVerboseLogging) {
          console.log("🔁 Interaction Event Received:");
          console.table({
            newState,
            callType,
            skill,
            campaign,
            callId: interactionData?.callId,
            phoneNumber: interactionData?.ani,
            customerNumber: interactionData?.dnis
          });
        } else {
          console.log(`State: ${newState} | CallType: ${callType}`);
        }

        // Only proceed when call connects AND is in allowed call types
        if (newState === "TALKING" && allowedCallTypes.includes(callType)) {
          console.log(`🎶 Call type "${callType}" matched — playing prompt "${promptName}"`);

          interactionApi.executeAction({
            action: "playPrompt",
            parameters: { promptName: promptName }
          })
          .then(result => {
            console.log("✅ Prompt playback initiated successfully:", result);
          })
          .catch(err => {
            console.error("❌ Error playing Skill prompt:", err);
          });
        } else if (newState === "TALKING") {
          console.log(`⚠️ Skipping prompt — call type "${callType}" not in allowed list.`);
        }
      }
    });

    console.log("🚀 Five9 Auto Prompt (Debug) script initialized and ready.");
  });
})();

