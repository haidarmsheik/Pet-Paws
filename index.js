document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-me');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const message = document.getElementById('message');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        

        const email = emailField.value.trim();
        const password = passwordField.value.trim();

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                if (userCredential.user.email === window.ADMIN_EMAIL) {
                    sessionStorage.setItem('adminSession', 'true');
                    sessionStorage.setItem('adminEmail', userCredential.user.email);
                } else {
                    sessionStorage.removeItem('adminSession');
                    sessionStorage.removeItem('adminEmail');
                }

                window.location.href = "Home.html";
            })
            .catch((error) => {
                console.error('Login error:', error.code);
                message.innerText = error.message;
            });
    });
});