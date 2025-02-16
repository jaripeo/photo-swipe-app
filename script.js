const folderButton = document.getElementById('folderButton');
const photoContainer = document.getElementById('photoContainer');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const photoIndex = document.getElementById('photoIndex');
const endMessage = document.getElementById('endMessage');
const viewResultsButton = document.getElementById('viewResultsButton');
const resultsContainer = document.getElementById('resultsContainer');
const keptPhotosContainer = document.getElementById('keptPhotos');
const deletedPhotosContainer = document.getElementById('deletedPhotos');
const commitChangesButton = document.getElementById('commitChangesButton');
let currentCardIndex = 0;
let files = [];
let keptPhotos = [];
let deletedPhotos = [];
let atEnd = false;
let directoryHandle;

folderButton.addEventListener('click', async () => {
    directoryHandle = await window.showDirectoryPicker();
    files = [];

    for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file' && entry.name.match(/\.(jpg|jpeg|png|gif|avif)$/i)) {
            files.push(entry);
        }
    }

    currentCardIndex = 0;
    keptPhotos = [];
    deletedPhotos = [];
    displayPhoto(currentCardIndex);
    updatePhotoIndex();
    endMessage.style.display = 'none';
    resultsContainer.style.display = 'none';
    photoContainer.style.display = 'flex';
    atEnd = false;
});

async function displayPhoto(index) {
    if (index < 0 || index >= files.length) return;

    const fileHandle = files[index];
    const file = await fileHandle.getFile();
    const reader = new FileReader();
    reader.onload = (e) => {
        photoContainer.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'card photo';
        card.style.backgroundImage = `url(${e.target.result})`;
        card.style.backgroundSize = 'contain'; // Ensure the image fits inside the container
        card.style.backgroundRepeat = 'no-repeat'; // Prevent the image from repeating
        card.style.backgroundPosition = 'center';

        let startX;
        card.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        card.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const change = touch.clientX - startX;
            card.style.transform = `translateX(${change}px)`;
        });

        card.addEventListener('touchend', (e) => {
            const change = e.changedTouches[0].clientX - startX;
            if (change > 100) {
                card.classList.add('keep');
                card.textContent = 'Kept';
                updatePhotoGroup(fileHandle.name, 'kept', e.target.result);
                setTimeout(() => {
                    if (currentCardIndex < files.length - 1) {
                        currentCardIndex++;
                        displayPhoto(currentCardIndex);
                        updatePhotoIndex();
                    } else {
                        endMessage.style.display = 'block';
                        photoContainer.innerHTML = '';
                        atEnd = true;
                    }
                }, 300);
            } else if (change < -100) {
                card.classList.add('delete');
                card.textContent = 'Deleted';
                updatePhotoGroup(fileHandle.name, 'deleted', e.target.result);
                setTimeout(() => {
                    if (currentCardIndex < files.length - 1) {
                        currentCardIndex++;
                        displayPhoto(currentCardIndex);
                        updatePhotoIndex();
                    } else {
                        endMessage.style.display = 'block';
                        photoContainer.innerHTML = '';
                        atEnd = true;
                    }
                }, 300);
            } else {
                card.style.transform = 'translateX(0)';
            }
        });

        photoContainer.appendChild(card);
    };
    reader.readAsDataURL(file);
}

function updatePhotoIndex() {
    photoIndex.textContent = `${currentCardIndex + 1}/${files.length}`;
}

function updatePhotoGroup(name, group, url) {
    // Remove the photo from both groups
    keptPhotos = keptPhotos.filter(photo => photo.name !== name);
    deletedPhotos = deletedPhotos.filter(photo => photo.name !== name);

    // Add the photo to the specified group
    if (group === 'kept') {
        keptPhotos.push({ name, url });
    } else if (group === 'deleted') {
        deletedPhotos.push({ name, url });
    }
}

prevButton.addEventListener('click', () => {
    if (atEnd) {
        atEnd = false;
        currentCardIndex = files.length - 1;
        displayPhoto(currentCardIndex);
        updatePhotoIndex();
        endMessage.style.display = 'none';
        resultsContainer.style.display = 'none';
        photoContainer.style.display = 'flex';
    } else if (currentCardIndex > 0) {
        currentCardIndex--;
        displayPhoto(currentCardIndex);
        updatePhotoIndex();
        endMessage.style.display = 'none';
        resultsContainer.style.display = 'none';
        photoContainer.style.display = 'flex';
    }
});

nextButton.addEventListener('click', () => {
    if (currentCardIndex < files.length - 1) {
        currentCardIndex++;
        displayPhoto(currentCardIndex);
        updatePhotoIndex();
        endMessage.style.display = 'none';
        resultsContainer.style.display = 'none';
        photoContainer.style.display = 'flex';
    }
});

document.addEventListener('keydown', (e) => {
    const cards = document.querySelectorAll('.card');
    if (cards.length === 0) return;

    const currentCard = cards[0];

    if (e.key === 'ArrowRight') {
        currentCard.classList.add('keep');
        currentCard.textContent = 'Kept';
        updatePhotoGroup(files[currentCardIndex].name, 'kept', currentCard.style.backgroundImage.slice(5, -2));
        setTimeout(() => {
            if (currentCardIndex < files.length - 1) {
                currentCardIndex++;
                displayPhoto(currentCardIndex);
                updatePhotoIndex();
            } else {
                atEnd = true;
                photoContainer.innerHTML = 'That\'s the end of the folder';
                endMessage.style.display = 'block';
            }
        }, 300);
    } else if (e.key === 'ArrowLeft') {
        currentCard.classList.add('delete');
        currentCard.textContent = 'Deleted';
        updatePhotoGroup(files[currentCardIndex].name, 'deleted', currentCard.style.backgroundImage.slice(5, -2));
        setTimeout(() => {
            if (currentCardIndex < files.length - 1) {
                currentCardIndex++;
                displayPhoto(currentCardIndex);
                updatePhotoIndex();
            } else {
                atEnd = true;
                photoContainer.innerHTML = 'That\'s the end of the folder';
                endMessage.style.display = 'block';
            }
        }, 300);
    }
});

viewResultsButton.addEventListener('click', () => {
    resultsContainer.style.display = 'block';
    photoContainer.style.display = 'none';
    keptPhotosContainer.innerHTML = '';
    deletedPhotosContainer.innerHTML = '';

    keptPhotos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.url;
        keptPhotosContainer.appendChild(img);
    });

    deletedPhotos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.url;
        deletedPhotosContainer.appendChild(img);
    });
});

commitChangesButton.addEventListener('click', async () => {
    for (const photo of deletedPhotos) {
        await directoryHandle.removeEntry(photo.name);
    }
    alert('Deleted photos have been removed.');
    resultsContainer.style.display = 'none';
    photoContainer.style.display = 'flex';
});