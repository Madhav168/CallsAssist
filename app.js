document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('number-input');
    const addBtn = document.getElementById('add-numbers');
    const clearBtn = document.getElementById('clear-all');
    const numberList = document.getElementById('number-list');
    const inputContainer = document.getElementById('input-container');
    const headerStats = document.getElementById('header-stats');
    const totalCount = document.getElementById('total-count');
    const remainingCount = document.getElementById('remaining-count');

    let numbers = JSON.parse(localStorage.getItem('amma_numbers') || '[]');

    const saveAndRender = () => {
        localStorage.setItem('amma_numbers', JSON.stringify(numbers));
        renderList();
        updateVisibility();
    };

    const updateVisibility = () => {
        if (numbers.length > 0) {
            inputContainer.classList.add('hidden');
            clearBtn.classList.remove('hidden');
            headerStats.classList.remove('hidden');
        } else {
            inputContainer.classList.remove('hidden');
            clearBtn.classList.add('hidden');
            headerStats.classList.add('hidden');
        }
    };

    const renderList = () => {
        numberList.innerHTML = '';
        let done = 0;

        numbers.forEach((item, index) => {
            if (item.done) done++;

            const li = document.createElement('li');
            li.className = `number-item ${item.done ? 'done' : ''}`;
            
            li.innerHTML = `
                <div class="item-top">
                    <div class="number-main">
                        <span class="number-value">${item.phone}</span>
                        ${item.done ? `
                            <span class="check-mark">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </span>
                        ` : ''}
                    </div>
                    <div class="action-group">
                        <button id="notes-btn-${index}" class="btn btn-notes ${item.note ? 'has-note' : ''}" onclick="toggleNote(${index})">Notes</button>
                        ${item.done 
                            ? `<a href="tel:${item.phone}" class="recall-btn">Recall</a>` 
                            : `<a href="tel:${item.phone}" class="call-btn" onclick="markAsDone(${index})">Call</a>`
                        }
                    </div>
                </div>
                <div id="note-container-${index}" class="notes-container hidden">
                    <textarea class="note-box" placeholder="Add notes here..." oninput="updateNote(${index}, this.value)">${item.note || ''}</textarea>
                </div>
            `;
            numberList.appendChild(li);
        });

        totalCount.textContent = numbers.length;
        remainingCount.textContent = numbers.length - done;
    };

    const parseNumbers = (text) => {
        const normalized = text.replace(/[\-\(\)]/g, '');
        const potential = normalized.split(/[\n\t,;]|\s{1,}/);
        const results = [];
        potential.forEach(p => {
            const cleaned = p.trim().replace(/[^\d+]/g, '');
            if (cleaned.length >= 7 && cleaned.length <= 15) {
                results.push(cleaned);
            }
        });
        return [...new Set(results)];
    };

    addBtn.addEventListener('click', () => {
        const text = numberInput.value.trim();
        if (!text) return;

        const newNumbers = parseNumbers(text);
        if (newNumbers.length === 0) {
            alert('No valid numbers found!');
            return;
        }

        const items = newNumbers.map(num => ({
            phone: num,
            done: false,
            note: ''
        }));

        numbers = [...numbers, ...items];
        numberInput.value = '';
        saveAndRender();
    });

    clearBtn.addEventListener('click', () => {
        if (numbers.length === 0) return;
        if (confirm('Are you sure you want to clear all numbers?')) {
            numbers = [];
            saveAndRender();
        }
    });

    window.markAsDone = (index) => {
        numbers[index].done = true;
        saveAndRender();
    };

    window.toggleNote = (index) => {
        const containers = document.querySelectorAll('.notes-container');
        const target = document.getElementById(`note-container-${index}`);
        const isHidden = target.classList.contains('hidden');
        
        containers.forEach(c => c.classList.add('hidden'));
        
        if (isHidden) {
            target.classList.remove('hidden');
            target.querySelector('textarea').focus();
        }
    };

    window.updateNote = (index, value) => {
        numbers[index].note = value;
        localStorage.setItem('amma_numbers', JSON.stringify(numbers));
        
        const notesBtn = document.getElementById(`notes-btn-${index}`);
        if (notesBtn) {
            if (value.trim()) notesBtn.classList.add('has-note');
            else notesBtn.classList.remove('has-note');
        }
    };

    renderList();
    updateVisibility();
});
