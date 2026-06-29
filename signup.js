document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm-password');
    const addressField = document.getElementById('address'); // New address field
    const phoneField = document.getElementById('phone'); // New phone number field
    const signupBtn = document.getElementById('signup-btn');
    const message = document.getElementById('message');

    // Add signup event
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        
        const email = emailField.value;
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        const address = addressField.value; // Get address value
        const phone = phoneField.value; // Get phone number value
        
        if (password !== confirmPassword) {
            message.innerText = "Passwords do not match";
            return;
        }

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return firebase.database().ref('users/' + userCredential.user.uid).set({
                    email: email,
                    phone: phone,
                    address: address
                });
            })
            .then(() => {
                message.innerText = "Sign up successful";
                window.location.href = "index.html";
            })
            .catch((error) => {
                message.innerText = error.message;
            });
    });
});