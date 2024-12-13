<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Path to the JSON file
$file = __DIR__ . '/data.json';
$imageUploadDir = __DIR__ . '/uploads/'; // Absolute path for uploads directory

// Get current data
$json = file_get_contents($file);
$data = json_decode($json, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if file is uploaded
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imageName = basename($_FILES['image']['name']);
        $imagePath = $imageUploadDir . $imageName;

        // Move the uploaded file
        if (move_uploaded_file($_FILES['image']['tmp_name'], $imagePath)) {
            // Get form data
            $trackingID = $_POST['trackingID'] ?? '';
            $status = $_POST['status'] ?? '';
            $location = $_POST['location'] ?? '';
            $estimatedArrival = $_POST['estimatedArrival'] ?? '';

            if ($trackingID) {
                // Update JSON data
                $data[$trackingID] = [
                    'status' => $status,
                    'location' => $location,
                    'estimatedArrival' => $estimatedArrival,
                    'image' => 'uploads/' . $imageName,
                ];

                // Save updated data back to the JSON file
                if (file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT))) {
                    echo "Data for Tracking ID {$trackingID} updated successfully!";
                } else {
                    echo "Failed to write to JSON file.";
                }
            } else {
                echo "Tracking ID is missing.";
            }
        } else {
            echo "Error moving uploaded file.";
        }
    } else {
        echo "File upload failed.";
    }
} else {
    echo "Invalid request method.";
}
?>
