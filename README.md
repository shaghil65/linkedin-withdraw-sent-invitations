# linkedin-withdraw-sent-invitations
A JavaScript script to automate the withdrawal of sent LinkedIn connection invitations from the browser console.

# LinkedIn Sent Invitation Withdrawal Script: Bulk Clean Up Your Pending Connection Requests

## 🚀 Overview: Automate LinkedIn Invitation Management

Are you looking for a **fast and efficient way to withdraw hundreds or thousands of pending LinkedIn connection requests**? Manually cleaning up your "Sent" invitations list can be incredibly tedious and time-consuming. Many users search for a reliable **LinkedIn automation script** or a **bulk withdraw tool for LinkedIn invitations**, but often find limited or complex solutions.

I faced this exact challenge recently. Unable to find a simple, client-side **JavaScript snippet** to automate this process, I decided to build one myself!

This repository provides a straightforward **browser console script** designed to help you **mass-withdraw sent LinkedIn connection requests** safely and effectively. It's a **DIY LinkedIn cleaner** that runs directly in your web browser, making it accessible without installing third-party applications.

## ✨ Why Use This LinkedIn Automation Script?

* **Effortless Cleanup:** Quickly **withdraw unaccepted LinkedIn invitations** that clutter your profile.
* **Boost Productivity:** Save hours of manual clicking with this efficient **LinkedIn bulk withdrawal tool**.
* **Maintain a Tidy Network:** Keep your "Sent" invitations list organized, allowing for better management of your professional outreach.
* **Simple & Direct:** A pure **JavaScript solution** that operates within your browser, requiring no external software.

## 🛡️ How This Script Works: Safe & Responsible LinkedIn Automation

My top priority during development was to create a script that operates responsibly and minimizes the risk of triggering LinkedIn's automation detection systems. This **LinkedIn withdrawal script** is built with human-like interaction principles:

1.  **Smart Content Loading:** It intelligently loads all your sent invitations by repeatedly clicking the "Load more" button with strategic delays, mimicking a user scrolling and interacting.
2.  **Batched Processing:** Instead of attempting to withdraw all requests simultaneously, the script processes them in small, manageable batches.
3.  **Inter-Batch Delays:** A crucial, longer pause is introduced *between* each batch. This gives LinkedIn's servers and your browser time to respond, making the activity appear less bot-like and more natural.
4.  **Staggered Clicks:** Within each batch, individual "Withdraw" clicks are slightly staggered, avoiding a burst of perfectly simultaneous actions.
5.  **Confirmation Dialog Handling:** The script is programmed to specifically wait for and click the "Confirm Withdraw" button for each request that triggers a confirmation dialog.
6.  **Robust Element Selection:** It dynamically re-queries the Document Object Model (DOM) for buttons right before clicking them, adapting to potential changes on the page as items are withdrawn.

## ⚠️ Important Disclaimer: Use at Your Own Risk

While this **LinkedIn automation tool** is designed with caution and aims to mimic human-like interaction, **I cannot guarantee that LinkedIn's algorithms will not flag unusual activity.** Using any form of automation on a third-party platform carries inherent risks.

* **Use responsibly and sparingly.**
* **Always monitor the script's progress** in your browser's developer console.
* **LinkedIn's interface changes frequently.** If this **JavaScript LinkedIn tool** stops working, it might be due to an update in LinkedIn's page structure. I'll do my best to keep it updated, but you may need to inspect elements to find new selectors.

## 📖 How to Use This LinkedIn Cleaner Script

Follow these steps carefully to run the script in your browser:

1.  **Navigate to your Sent Invitations on LinkedIn:**
    * Go to your LinkedIn "My Network" page.
    * Click on "Manage all" next to "Invitations" (usually on the left sidebar).
    * Select the "Sent" tab.
2.  **Open Your Browser's Developer Console:**
    * **Chrome, Firefox, Edge:** Press `F12`.
    * Alternatively, right-click anywhere on the page and select "Inspect" or "Inspect Element," then navigate to the "Console" tab.
3.  **Copy the Script:** Copy the entire JavaScript code from the `script.js` file in this repository.
4.  **Paste and Execute:** Paste the copied code into the console's command line and press `Enter`.
5.  **Monitor Progress:** Keep the console open. You'll see messages logging the script's progress, including when it's loading more invitations, processing batches, and pausing between them. Observe the page – you should see the invitations disappear as they are withdrawn.

## 💻 The Script (`script.js`)

```javascript
// Function to automate withdrawing sent LinkedIn connection requests
async function withdrawAllRequestsAutomated() {
  let withdrawnCount = 0; // Counter for successfully withdrawn requests

  // Delays (in milliseconds) to mimic human interaction and avoid rate limiting
  const initialLoadDelay = 3000; // Time to wait for the page to fully load initially
  const loadMoreClickDelay = 2000; // Time to wait after clicking "Load more" for new items to render
  const batchSize = 10; // Number of withdrawals to attempt concurrently in a batch
  const batchDelay = 5000; // Delay between processing each batch of withdrawals
  const withdrawClickDelay = 1000; // Time to wait after clicking initial "Withdraw" for confirmation dialog
  const confirmClickDelay = 500; // Time to wait after confirming withdrawal before moving to next item in batch

  console.log("Starting automated withdrawal process...");

  // 1. Initial page load delay
  console.log(`Waiting ${initialLoadDelay / 1000} seconds for initial page load...`);
  await new Promise(resolve => setTimeout(resolve, initialLoadDelay));

  // 2. Click "Load more" repeatedly until all invitations are loaded
  console.log("Attempting to load all pending invitations...");
  let loadMoreAttempts = 0;
  const maxLoadMoreAttempts = 500; // Max attempts to click "Load more" (safety limit)
  const maxConsecutiveNoNewItems = 3; // How many times "Load more" can yield no new items before stopping
  let consecutiveNoNewItemsCount = 0;

  while (loadMoreAttempts < maxLoadMoreAttempts) {
    const previousLoadedRequestCount = document.querySelectorAll("button[data-view-name='sent-invitations-withdraw-single']").length;
    
    // Find the "Load more" button by its text content
    let loadMoreButton = Array.from(document.querySelectorAll("button span")).find(
      span => span.innerText.trim() === "Load more"
    )?.closest("button");

    if (loadMoreButton && !loadMoreButton.disabled) {
      console.log(`Clicking "Load more" button (attempt ${loadMoreAttempts + 1}/${maxLoadMoreAttempts})...`);
      try {
        loadMoreButton.click();
        await new Promise(resolve => setTimeout(resolve, loadMoreClickDelay));
        loadMoreAttempts++;

        const currentLoadedRequestCount = document.querySelectorAll("button[data-view-name='sent-invitations-withdraw-single']").length;
        console.log(`Post-Load More click: Found ${currentLoadedRequestCount} requests.`);

        // Check if new items were loaded
        if (currentLoadedRequestCount === previousLoadedRequestCount) {
          consecutiveNoNewItemsCount++;
          console.log(`No new requests loaded. Consecutive no-new-items count: ${consecutiveNoNewItemsCount}/${maxConsecutiveNoNewItems}`);
          if (consecutiveNoNewItemsCount >= maxConsecutiveNoNewItems) {
            console.log("Reached limit of consecutive 'no new items'. Assuming all items are loaded.");
            break; // Exit loop if no new items loaded consecutively
          }
        } else {
          consecutiveNoNewItemsCount = 0; // Reset counter if new items were loaded
        }

      } catch (e) {
        console.warn("Error clicking 'Load more' button, it might be truly gone or inaccessible:", e);
        break; // Exit loop on error
      }
    } else {
      console.log("No 'Load more' button found or it's genuinely disabled. All items loaded (or reached the end).");
      break; // Exit loop if "Load more" button is gone or disabled
    }
  }

  // 3. Collect all "Withdraw" buttons after all items are loaded
  let allWithdrawButtons = Array.from(document.querySelectorAll("button[data-view-name='sent-invitations-withdraw-single']"));

  if (allWithdrawButtons.length === 0) {
    console.log("No pending connection requests with withdraw buttons found on the page.");
    return;
  }

  console.log(`Found a total of ${allWithdrawButtons.length} pending connection requests to withdraw.`);

  // 4. Process withdrawals in batches
  for (let i = 0; i < allWithdrawButtons.length; i += batchSize) {
    const batch = allWithdrawButtons.slice(i, i + batchSize);
    console.log(`--- Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(allWithdrawButtons.length / batchSize)} (${batch.length} items) ---`);

    // Use Promise.all to process items in the current batch concurrently
    await Promise.all(batch.map(async (button, indexInBatch) => {
      // Re-query the button from the DOM just before acting to ensure it's still there and fresh
      // This helps with dynamic DOM changes after previous withdrawals
      const liveButton = document.querySelector(`[data-view-name="sent-invitations-withdraw-single"]:nth-child(${allWithdrawButtons.indexOf(button) + 1})`);

      // Ensure the button is still in the DOM, visible, and clickable
      if (liveButton && document.body.contains(liveButton) && liveButton.offsetParent !== null && !liveButton.disabled) {
        try {
          // Introduce a small staggered delay within the batch to avoid simultaneous clicks
          await new Promise(resolve => setTimeout(resolve, indexInBatch * 100)); // 100ms stagger

          console.log(`Attempting withdrawal for item in batch (original index: ${allWithdrawButtons.indexOf(button)})...`);
          liveButton.click(); // Click the initial "Withdraw" button
          await new Promise(resolve => setTimeout(resolve, withdrawClickDelay)); // Wait for confirmation dialog to appear

          // Find the confirmation "Withdraw" button within the visible dialog
          const confirmDialogButton = Array.from(document.querySelectorAll("button span")).find(
            span => span.innerText.trim() === "Withdraw" && span.closest('[role="dialog"]') // Ensure it's within a dialog
          )?.closest("button");


          if (confirmDialogButton && document.body.contains(confirmDialogButton) && !confirmDialogButton.disabled) {
            console.log(`Confirmed withdrawal for item in batch.`);
            confirmDialogButton.click(); // Click the confirmation "Withdraw" button
            withdrawnCount++;
            await new Promise(resolve => setTimeout(resolve, confirmClickDelay)); // Wait briefly after confirmation
          } else {
            console.warn(`Could not find or click the confirmation "Withdraw" button for item in batch. This request might not be withdrawn.`);
            await new Promise(resolve => setTimeout(resolve, confirmClickDelay)); // Short wait even if confirmation fails
          }
        } catch (e) {
          console.error(`Error processing item in batch:`, e);
          await new Promise(resolve => setTimeout(resolve, confirmClickDelay)); // Wait even on error to prevent cascading issues
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

  // Final summary messages
  if (withdrawnCount === 0 && allWithdrawButtons.length > 0) {
      console.warn("No invitations were withdrawn. This might be due to all invitations being processed already, or a change in LinkedIn's page structure.");
  } else if (withdrawnCount < allWithdrawButtons.length) {
      console.warn(`Note: Not all ${allWithdrawButtons.length} requests found were successfully withdrawn. Some might have failed or disappeared during processing.`);
  }
}

// Execute the main function
withdrawAllRequestsAutomated();
