// Simple client-side authentication using localStorage

// Get elements
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// Hashing Function
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// SIGNUP
if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
        const email = document.getElementById("signupEmail").value.trim();
        const rawPassword = document.getElementById("signupPassword").value;

        if (!email || !rawPassword) return;

        let users = getUsers();
        if (users.find(u => u.email === email)) {
            const signupError = document.getElementById("signupError");
            if (signupError) signupError.innerText = "Email already exists!";
            return;
        }

        // Hash the password before pushing
        const hashedPassword = await hashPassword(rawPassword);
        users.push({ email, password: hashedPassword });
        
        saveUsers(users);
        localStorage.setItem("currentUser", email);
        window.location.href = "index.html"; // Redirect to todo app
    });
}

// LOGIN
if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        const email = document.getElementById("loginEmail").value.trim();
        const rawPassword = document.getElementById("loginPassword").value;

        if (!email || !rawPassword) return;

        // Hash input to compare with stored hash
        const hashedPassword = await hashPassword(rawPassword); 
        
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === hashedPassword);

        if (!user) {
            const loginError = document.getElementById("loginError");
            if (loginError) loginError.innerText = "Invalid email or password!";
            return;
        }

        localStorage.setItem("currentUser", email);
        window.location.href = "index.html"; // Redirect to todo app
    });
}