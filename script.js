fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const trackingData = data[trackingNumber];
        const trackingInfoDiv = document.getElementById('trackingInfo');
        if (trackingData) {
            trackingInfoDiv.innerHTML = `
                <img src="${trackingData.image}" alt="Tracking Image" class="tracking-image">
                <div class="tracking-info">
                    <h2>Status: ${trackingData.status}</h2>
                    <p>Location: ${trackingData.location}</p>
                    <p>Estimated Arrival: ${trackingData.estimatedArrival}</p>
                </div>
            `;
        } else {
            trackingInfoDiv.innerHTML = `<p class="error-message">Invalid Tracking Number.</p>`;
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        document.getElementById('trackingInfo').innerHTML = `<p class="error-message">There was an error fetching the tracking details.</p>`;
    });
