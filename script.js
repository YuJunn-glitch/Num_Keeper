/* =========================================================
   NUMBER VAULT
   WHO PICKED THIS NUMBER?
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const TOTAL = 1000;

const STORAGE_KEY =
    "numberVaultData";

const THEME_KEY =
    "numberVaultTheme";


/* =========================================================
   ELEMENTS
========================================================= */

const grid =
    document.getElementById("numberGrid");

const pickedList =
    document.getElementById("pickedList");

const pickedCount =
    document.getElementById("pickedCount");

const remainingCount =
    document.getElementById("remainingCount");

const progressPercent =
    document.getElementById("progressPercent");

const progressText =
    document.getElementById("progressText");

const progressBar =
    document.getElementById("progressBar");

const pickedBadge =
    document.getElementById("pickedBadge");

const searchInput =
    document.getElementById("searchInput");

const searchResult =
    document.getElementById("searchResult");

const resetBtn =
    document.getElementById("resetBtn");

const themeBtn =
    document.getElementById("themeBtn");


/* =========================================================
   PICK MODAL
========================================================= */

const pickModal =
    document.getElementById("pickModal");

const pickModalNumber =
    document.getElementById(
        "pickModalNumber"
    );

const pickerName =
    document.getElementById(
        "pickerName"
    );

const cancelPick =
    document.getElementById(
        "cancelPick"
    );

const confirmPick =
    document.getElementById(
        "confirmPick"
    );


/* =========================================================
   UNPICK MODAL
========================================================= */

const unpickModal =
    document.getElementById(
        "unpickModal"
    );

const unpickModalNumber =
    document.getElementById(
        "unpickModalNumber"
    );

const unpickPicker =
    document.getElementById(
        "unpickPicker"
    );

const cancelUnpick =
    document.getElementById(
        "cancelUnpick"
    );

const confirmUnpick =
    document.getElementById(
        "confirmUnpick"
    );


/* =========================================================
   STATE
========================================================= */


/*
    Each picked number looks like:

    {
        number: 27,
        pickedBy: "Yu Junn",
        pickedAt: "19 Aug 2026, 18:30"
    }
*/

let pickedNumbers =
    loadData();


let currentFilter =
    "all";


let numberWaitingToPick =
    null;


let numberWaitingToUnpick =
    null;


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {
            return [];
        }


        const data =
            JSON.parse(saved);


        if (!Array.isArray(data)) {
            return [];
        }


        /*
         * Validate old/corrupted data.
         */

        return data.filter(item => {

            return (
                item &&
                Number.isInteger(
                    item.number
                ) &&
                item.number >= 0 &&
                item.number <= 999 &&
                typeof item.pickedBy ===
                    "string"
            );

        });

    } catch (error) {

        console.error(
            "Could not load data:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                pickedNumbers
            )
        );

    } catch (error) {

        console.error(
            "Could not save data:",
            error
        );

    }

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(number) {

    return String(number)
        .padStart(3, "0");

}


/* =========================================================
   FIND NUMBER INFO
========================================================= */

function getNumberInfo(number) {

    return pickedNumbers.find(
        item =>
            item.number === number
    );

}


/* =========================================================
   CHECK IF PICKED
========================================================= */

function isPicked(number) {

    return Boolean(
        getNumberInfo(number)
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {

    return new Intl.DateTimeFormat(
        "en-US",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);

}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

    const picked =
        pickedNumbers.length;

    const remaining =
        TOTAL - picked;

    const percentage =
        (picked / TOTAL) * 100;


    pickedCount.textContent =
        picked;

    remainingCount.textContent =
        remaining;

    progressPercent.textContent =
        percentage.toFixed(1) + "%";

    progressText.textContent =
        `${picked} / ${TOTAL}`;

    progressBar.style.width =
        percentage + "%";

    pickedBadge.textContent =
        picked;

}


/* =========================================================
   FILTER
========================================================= */

function shouldShow(number) {

    if (
        currentFilter ===
        "picked"
    ) {

        return isPicked(number);

    }


    if (
        currentFilter ===
        "remaining"
    ) {

        return !isPicked(number);

    }


    return true;

}


/* =========================================================
   RENDER NUMBER GRID
========================================================= */

function renderGrid() {

    grid.innerHTML = "";


    const fragment =
        document.createDocumentFragment();


    for (
        let number = 0;
        number < TOTAL;
        number++
    ) {

        if (
            !shouldShow(number)
        ) {

            continue;

        }


        const button =
            document.createElement(
                "button"
            );


        button.type = "button";

        button.className =
            "number";


        button.textContent =
            formatNumber(number);


        /*
         * Picked state.
         */

        if (
            isPicked(number)
        ) {

            button.classList.add(
                "picked"
            );

        }


        /*
         * Hover information.
         */

        const info =
            getNumberInfo(number);


        if (info) {

            button.title =
                `Picked by ${info.pickedBy}`;

        } else {

            button.title =
                "Available — click to pick";

        }


        /*
         * Click behavior.
         */

        button.addEventListener(
            "click",
            () => {

                if (
                    isPicked(number)
                ) {

                    /*
                     * IMPORTANT:
                     * Never directly unpick.
                     *
                     * Always ask confirmation.
                     */

                    openUnpickModal(
                        number
                    );

                } else {

                    /*
                     * Ask who picked it.
                     */

                    openPickModal(
                        number
                    );

                }

            }
        );


        fragment.appendChild(
            button
        );

    }


    grid.appendChild(
        fragment
    );

}


/* =========================================================
   OPEN PICK MODAL
========================================================= */

function openPickModal(number) {

    numberWaitingToPick =
        number;


    pickModalNumber.textContent =
        formatNumber(number);


    pickerName.value = "";


    pickModal.classList.add(
        "show"
    );


    pickModal.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * Focus name input.
     */

    setTimeout(
        () => pickerName.focus(),
        100
    );

}


/* =========================================================
   CLOSE PICK MODAL
========================================================= */

function closePickModal() {

    numberWaitingToPick =
        null;


    pickModal.classList.remove(
        "show"
    );


    pickModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   CONFIRM PICK
========================================================= */

function confirmPickNumber() {

    if (
        numberWaitingToPick === null
    ) {

        return;

    }


    const name =
        pickerName.value.trim();


    /*
     * Require a name.
     */

    if (!name) {

        pickerName.focus();

        pickerName.classList.add(
            "input-error"
        );


        setTimeout(
            () => {

                pickerName.classList.remove(
                    "input-error"
                );

            },
            500
        );


        return;

    }


    /*
     * Safety check.
     */

    if (
        isPicked(
            numberWaitingToPick
        )
    ) {

        closePickModal();

        return;

    }


    /*
     * Create record.
     */

    const record = {

        number:
            numberWaitingToPick,

        pickedBy:
            name,

        pickedAt:
            formatDate(
                new Date()
            )

    };


    pickedNumbers.push(
        record
    );


    /*
     * Sort by number.
     */

    pickedNumbers.sort(
        (a, b) =>
            a.number - b.number
    );


    saveData();

    updateStats();

    renderGrid();

    renderPickedList();

    updateSearchResult();


    closePickModal();

}


/* =========================================================
   PICK MODAL BUTTON
========================================================= */

confirmPick.addEventListener(
    "click",
    confirmPickNumber
);


/* =========================================================
   CANCEL PICK
========================================================= */

cancelPick.addEventListener(
    "click",
    closePickModal
);


/* =========================================================
   ENTER TO CONFIRM PICK
========================================================= */

pickerName.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            confirmPickNumber();

        }

    }
);


/* =========================================================
   OPEN UNPICK MODAL
========================================================= */

function openUnpickModal(number) {

    const info =
        getNumberInfo(number);


    if (!info) {
        return;
    }


    numberWaitingToUnpick =
        number;


    unpickModalNumber.textContent =
        formatNumber(number);


    unpickPicker.textContent =
        info.pickedBy;


    unpickModal.classList.add(
        "show"
    );


    unpickModal.setAttribute(
        "aria-hidden",
        "false"
    );


    cancelUnpick.focus();

}


/* =========================================================
   CLOSE UNPICK MODAL
========================================================= */

function closeUnpickModal() {

    numberWaitingToUnpick =
        null;


    unpickModal.classList.remove(
        "show"
    );


    unpickModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   CONFIRM UNPICK
========================================================= */

function confirmUnpickNumber() {

    if (
        numberWaitingToUnpick === null
    ) {

        return;

    }


    const index =
        pickedNumbers.findIndex(
            item =>
                item.number ===
                numberWaitingToUnpick
        );


    if (index !== -1) {

        pickedNumbers.splice(
            index,
            1
        );

    }


    saveData();

    updateStats();

    renderGrid();

    renderPickedList();

    updateSearchResult();


    closeUnpickModal();

}


/* =========================================================
   UNPICK BUTTON
========================================================= */

confirmUnpick.addEventListener(
    "click",
    confirmUnpickNumber
);


/* =========================================================
   CANCEL UNPICK
========================================================= */

cancelUnpick.addEventListener(
    "click",
    closeUnpickModal
);


/* =========================================================
   CLICK OUTSIDE MODALS
========================================================= */

pickModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            pickModal
        ) {

            closePickModal();

        }

    }
);


unpickModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            unpickModal
        ) {

            closeUnpickModal();

        }

    }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        if (
            pickModal.classList.contains(
                "show"
            )
        ) {

            closePickModal();

        }


        if (
            unpickModal.classList.contains(
                "show"
            )
        ) {

            closeUnpickModal();

        }

    }
);


/* =========================================================
   RENDER PICKED LIST
========================================================= */

function renderPickedList() {

    pickedList.innerHTML = "";


    /*
     * Empty state.
     */

    if (
        pickedNumbers.length === 0
    ) {

        pickedList.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    🔒
                </div>

                <p>
                    No numbers picked yet.
                </p>

            </div>

        `;

        return;

    }


    const fragment =
        document.createDocumentFragment();


    pickedNumbers.forEach(
        info => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "picked-item";


            /*
             * Number.
             */

            const number =
                document.createElement(
                    "div"
                );

            number.className =
                "picked-item-number";

            number.textContent =
                formatNumber(
                    info.number
                );


            /*
             * Information.
             */

            const infoBox =
                document.createElement(
                    "div"
                );

            infoBox.className =
                "picked-item-info";


            const name =
                document.createElement(
                    "div"
                );

            name.className =
                "picked-by";

            name.textContent =
                info.pickedBy;


            const time =
                document.createElement(
                    "div"
                );

            time.className =
                "picked-time";

            time.textContent =
                info.pickedAt;


            infoBox.appendChild(
                name
            );

            infoBox.appendChild(
                time
            );


            /*
             * Lock.
             */

            const lock =
                document.createElement(
                    "div"
                );

            lock.className =
                "lock-icon";

            lock.textContent =
                "🔒";


            /*
             * Assemble.
             */

            item.appendChild(
                number
            );

            item.appendChild(
                infoBox
            );

            item.appendChild(
                lock
            );


            /*
             * Clicking item opens
             * protected unpick modal.
             */

            item.addEventListener(
                "click",
                () => {

                    openUnpickModal(
                        info.number
                    );

                }
            );


            fragment.appendChild(
                item
            );

        }
    );


    pickedList.appendChild(
        fragment
    );

}


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    () => {

        const value =
            searchInput.value.trim();


        /*
         * Empty.
         */

        if (!value) {

            searchResult.className =
                "search-result hidden";

            return;

        }


        /*
         * Number search.
         */

        if (
            /^\d{1,3}$/.test(value)
        ) {

            const number =
                parseInt(
                    value,
                    10
                );


            if (
                number >= 0 &&
                number <= 999
            ) {

                showSearchResult(
                    number
                );

                return;

            }

        }


        /*
         * Name search.
         */

        const matches =
            pickedNumbers.filter(
                info =>
                    info.pickedBy
                        .toLowerCase()
                        .includes(
                            value.toLowerCase()
                        )
            );


        if (
            matches.length
        ) {

            searchResult.className =
                "search-result search-picked";


            const names =
                matches
                    .slice(0, 5)
                    .map(
                        info =>
                            `${formatNumber(info.number)} — ${info.pickedBy}`
                    )
                    .join(" • ");


            searchResult.textContent =
                `👤 Found: ${names}`;

        } else {

            searchResult.className =
                "search-result error";

            searchResult.textContent =
                "No matching number or person found.";

        }

    }
);


/* =========================================================
   SHOW NUMBER SEARCH RESULT
========================================================= */

function showSearchResult(number) {

    const info =
        getNumberInfo(number);


    if (info) {

        searchResult.className =
            "search-result search-picked";


        searchResult.textContent =
            `🔒 ${formatNumber(number)} is picked by ${info.pickedBy}.`;

    } else {

        searchResult.className =
            "search-result available";


        searchResult.textContent =
            `🟢 ${formatNumber(number)} is available.`;

    }

}


/* =========================================================
   UPDATE SEARCH
========================================================= */

function updateSearchResult() {

    const value =
        searchInput.value.trim();


    if (
        /^\d{1,3}$/.test(value)
    ) {

        const number =
            parseInt(
                value,
                10
            );


        if (
            number >= 0 &&
            number <= 999
        ) {

            showSearchResult(
                number
            );

        }

    }

}


/* =========================================================
   FILTERS
========================================================= */

document
    .querySelectorAll(".filter")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".filter"
                        )
                        .forEach(
                            btn => {

                                btn.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.filter;


                    renderGrid();

                }
            );

        }
    );


/* =========================================================
   RESET ALL
========================================================= */

resetBtn.addEventListener(
    "click",
    () => {

        if (
            pickedNumbers.length === 0
        ) {

            return;

        }


        const confirmed =
            window.confirm(
                "⚠️ RESET ALL PICKED NUMBERS?\n\nEvery picked number and its owner's name will be removed."
            );


        if (!confirmed) {
            return;
        }


        pickedNumbers = [];


        saveData();

        updateStats();

        renderGrid();

        renderPickedList();


        searchInput.value = "";

        searchResult.className =
            "search-result hidden";

    }
);


/* =========================================================
   DAY / NIGHT
========================================================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            THEME_KEY
        );


    if (
        saved === "light"
    ) {

        document.body.classList.add(
            "light"
        );

        themeBtn.textContent =
            "🌙";

        themeBtn.title =
            "Switch to Night Mode";

    } else {

        document.body.classList.remove(
            "light"
        );

        themeBtn.textContent =
            "☀️";

        themeBtn.title =
            "Switch to Day Mode";

    }

}


/* =========================================================
   THEME BUTTON
========================================================= */

themeBtn.addEventListener(
    "click",
    () => {

        const light =
            document.body.classList.contains(
                "light"
            );


        if (light) {

            document.body.classList.remove(
                "light"
            );

            localStorage.setItem(
                THEME_KEY,
                "dark"
            );

            themeBtn.textContent =
                "☀️";

            themeBtn.title =
                "Switch to Day Mode";

        } else {

            document.body.classList.add(
                "light"
            );

            localStorage.setItem(
                THEME_KEY,
                "light"
            );

            themeBtn.textContent =
                "🌙";

            themeBtn.title =
                "Switch to Night Mode";

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeApp() {

    loadTheme();

    updateStats();

    renderGrid();

    renderPickedList();

}


initializeApp();