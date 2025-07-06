async function withdrawAllRequestsAutomated() {
  let withdrawnCount = 0;
  const initialLoadDelay = 3000; // Give page a moment to fully load initially
  const loadMoreClickDelay = 2000; // Time to wait after clicking "Load more"
  const batchSize = 10; // Number of withdrawals to attempt concurrently in a batch
  const batchDelay = 5000; // Delay in milliseconds between batches (5 seconds)
  const withdrawClickDelay = 1000; // Time to wait after clicking initial "Withdraw" for confirmation dialog (within a batch)
  const confirmClickDelay = 500; // Time to wait after confirming withdrawal before next item in batch

  console.log("Starting automated withdrawal process...");

  console.log(`Waiting ${initialLoadDelay / 1000} seconds for initial page load...`);
  await new Promise(resolve => setTimeout(resolve, initialLoadDelay));

  console.log("Attempting to load all pending invitations...");
  let loadMoreAttempts = 0;
  const maxLoadMoreAttempts = 500; // Max attempts to click "Load more"
  const maxConsecutiveNoNewItems = 3; // How many times can "Load more" yield no new items before stopping
  let consecutiveNoNewItemsCount = 0;

  // Loop to click "Load more" until no new items appear or max attempts reached
  while (loadMoreAttempts < maxLoadMoreAttempts) {
    const previousLoadedRequestCount = document.querySelectorAll("button[data-view-name='sent-invitations-withdraw-single']").length;
    
    let loadMoreButton = Array.from(document.querySelectorAll("button span")).find(
      span => span.innerText.trim() === "Load more"
    )?.closest("button");

    if (loadMoreButton && !loadMoreButton.disabled) {
      loadMoreButton.click();
      await new Promise(resolve => setTimeout(resolve, loadMoreClickDelay));
      loadMoreAttempts++;

      const currentLoadedRequestCount = document.querySelectorAll("button[data-view-name='sent-invitations-withdraw-single']").length;

      if (currentLoadedRequestCount === previousLoadedRequestCount) {
        consecutiveNoNewItemsCount++;
        if (consecutiveNoNewItemsCount >= maxConsecutiveNoNewItems) {
          console.log("Reached limit of consecutive 'no new items'. Assuming all items are loaded.");
          break; // Exit loop if no new items loaded consecutively
        }
      } else {
        consecutiveNoNewItemsCount = 0; // Reset counter if new items were loaded
      }

    } else {
      console.log("No 'Load more' button found or it's genuinely disabled. All items loaded (or reached the end).");
      break; // Exit loop if "Load more" button is gone or disabled
    }
  }

  // Collect all "Withdraw" buttons after all items are loaded
  let allWithdrawButtons = Array.from(document.querySelectorAll("button[data-view-name='sent-invitations-withdraw-single']"));

  if (allWithdrawButtons.length === 0) {
    console.log("No pending connection requests with withdraw buttons found on the page.");
    return;
  }

  console.log(`Found a total of ${allWithdrawButtons.length} pending connection requests to withdraw.`);

  // Process withdrawals in batches
  for (let i = 0; i < allWithdrawButtons.length; i += batchSize) {
    const batch = allWithdrawButtons.slice(i, i + batchSize);
    console.log(`--- Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allWithdrawButtons.length / batchSize)} (${batch.length} items) ---`);

    await Promise.all(batch.map(async (button, indexInBatch) => {
      // Re-query the button from the DOM just before acting to ensure it's still there and fresh
      const liveButton = document.querySelector(`[data-view-name="sent-invitations-withdraw-single"]:nth-child(${allWithdrawButtons.indexOf(button) + 1})`);

      if (liveButton && document.body.contains(liveButton) && liveButton.offsetParent !== null && !liveButton.disabled) {
        try {
          // Introduce a small staggered delay within the batch to avoid simultaneous clicks
          await new Promise(resolve => setTimeout(resolve, indexInBatch * 100)); // 100ms stagger

          console.log(`Attempting withdrawal for item in batch (original index: ${allWithdrawButtons.indexOf(button)})...`);
          liveButton.click(); // Click the initial "Withdraw" button
          await new Promise(resolve => setTimeout(resolve, withdrawClickDelay)); // Wait for confirmation dialog

          // Find the confirmation "Withdraw" button within the visible dialogs
          const confirmDialogButton = Array.from(document.querySelectorAll("button span")).find(
            span => span.innerText.trim() === "Withdraw" && span.closest('[role="dialog"]')
          )?.closest("button");


          if (confirmDialogButton && document.body.contains(confirmDialogButton) && !confirmDialogButton.disabled) {
            console.log(`Confirmed withdrawal for item in batch.`);
            confirmDialogButton.click(); // Click the confirmation "Withdraw" button
            withdrawnCount++;
            await new Promise(resolve => setTimeout(resolve, confirmClickDelay)); // Wait briefly after confirmation
          } else {
            console.warn(`Could not find or click the confirmation "Withdraw" button for item in batch. Skipping.`);
            await new Promise(resolve => setTimeout(resolve, confirmClickDelay)); // Short wait even if confirmation fails
          }
        } catch (e) {
          console.error(`Error processing item in batch:`, e);
          await new Promise(resolve => setTimeout(resolve, confirmClickDelay)); // Wait even on error
        }
      } else {
        // console.log(`Item in batch (original index: ${allWithdrawButtons.indexOf(button)}) already processed or not clickable.`); // Muted for cleaner logs
      }
    }));

    // Delay between batches to prevent rate limiting
    if (i + batchSize < allWithdrawButtons.length) { // Only delay if there are more batches to process
      console.log(`Waiting ${batchDelay / 1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, batchDelay));
    }
  }

  console.log(`--- Withdrawal Process Complete ---`);
  console.log(`Total invitations withdrawn: ${withdrawnCount}.`);

  if (withdrawnCount === 0 && allWithdrawButtons.length > 0) {
      console.warn("No invitations were withdrawn. This might be due to all invitations being processed already, or a change in LinkedIn's page structure.");
  } else if (withdrawnCount < allWithdrawButtons.length) {
      console.warn(`Note: Not all ${allWithdrawButtons.length} requests found were successfully withdrawn. Some might have failed or disappeared during processing.`);
  }
}

// Execute the function
withdrawAllRequestsAutomated();
