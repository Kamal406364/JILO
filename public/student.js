let map;
let marker;

document.addEventListener('DOMContentLoaded', async () => {
    const loader = document.getElementById('loader');
    loader.style.display = 'block'; 

    try {
        
        map = L.map('map').setView([12.9716, 77.5946], 10); 

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © OpenStreetMap contributors'
        }).addTo(map);

        await fetchBusIds(); 
    } catch (error) {
        console.error('Error during page load:', error);
        document.getElementById('errorMessage').textContent = 'Error initializing the map or fetching bus location.';
    } finally {
        loader.style.display = 'none'; 
    }
});


document.getElementById('getLocationBtn').addEventListener('click', async () => {
    const busId = document.getElementById('busIdSelect').value.trim(); 

    if (!busId) {
        alert('Please enter a valid Bus ID');
        return;
    }

    await fetchBusLocation(busId);
});

async function fetchBusLocation(busId) {
    try {
        const response = await fetch(`/getLocation?busId=${busId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

      
        console.log('Fetched location data:', data);

        if (data.location) {
            const { latitude, longitude } = data.location;
            map.setView([latitude, longitude], 13);

            if (marker) {
                marker.setLatLng([latitude, longitude]);
            } else {
                marker = L.marker([latitude, longitude]).addTo(map);
            }
        } else {
            document.getElementById('errorMessage').textContent = 'Location not found for this bus ID.';
        }
    } catch (error) {
        console.error('Error fetching bus location:', error);
        document.getElementById('errorMessage').textContent = `Error fetching bus location: ${error.message}`;
    }
}

async function fetchBusIds() {
    try {
        const response = await fetch('/buses'); 
        const data = await response.json();

        if (response.ok) {
            const busIdSelect = document.getElementById('busIdSelect');
            busIdSelect.innerHTML = ''; 

            data.busIds.forEach(busId => {
                const option = document.createElement('option');
                option.value = busId;
                option.textContent = busId;
                busIdSelect.appendChild(option);
            });
        } else {
            throw new Error(data.error || 'Unknown error occurred while fetching bus IDs.');
        }
    } catch (error) {
        console.error('Error fetching bus IDs:', error);
        document.getElementById('errorMessage').textContent = `Error fetching bus IDs: ${error.message}`;
    }
}
