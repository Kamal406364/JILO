
async function loginBus(event) {
    event.preventDefault(); 

    const busId = document.getElementById('loginBusId').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ busId, password }),
        });

        const result = await response.json();
        if (response.ok) {
            alert('Login successful!');
            
            localStorage.setItem('busId', busId);
            
            
            document.getElementById('shareLocationBtn').style.display = 'inline-block';
            
        } else {
            alert(result.error || 'Invalid credentials. Please try again.');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login. Please try again later.');
    }
}


async function registerBus(event) {
    event.preventDefault();

    const busId = document.getElementById('registerBusId').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ busId, password }),
        });

        const result = await response.json();
        alert(result.message || result.error);
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred during registration. Please try again later.');
    }
}


document.getElementById('shareLocationBtn').addEventListener('click', async () => {
    const busId = localStorage.getItem('busId'); 

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        const locationData = {
            busId: busId,
            latitude: latitude,
            longitude: longitude
        };

        try {
            const response = await fetch('/updateLocation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(locationData),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sharing location. Please try again later.');
        }
    }, (error) => {
        alert(`Error getting location: ${error.message}`);
    });
});


document.getElementById('loginForm').addEventListener('submit', loginBus);

