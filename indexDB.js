let openConnection = indexedDB.open("Todos", 1);
let db;

// CREATING OUR STORE
openConnection.onupgradeneeded = function (e) {
	db = openConnection.result;
	let store = db.createObjectStore("todo", {
		keyPath: "id",
		autoIncrement: true,
	});
	store.createIndex("title", "title", { unique: false });
	store.createIndex("completed", "completed", { unique: false });
};

// DATABASE CONNECTION CHECKING
openConnection.onsuccess = function (e) {
	db = openConnection.result;
	console.log("Database connection successful!");
	displayTodos();
};

// DATABASE CONNECTION CHECKING
openConnection.onerror = function (e) {
	console.error("Database error: ", e.target.error);
};

// TARGETING ADD BUTTON
document.getElementById("addBtn").addEventListener("click", function () {
	let newTodoText = document.getElementById("newTodo").value;
	if (newTodoText.trim()) {
		addTodo(newTodoText, false);
		document.getElementById("newTodo").value = "";
	}
});

// TARGETING SEARCH INPUT
document.getElementById("search").addEventListener("input", function () {
	let query = this.value.toLowerCase();
	filterTodos(query);
});

// ADDING TODO TO THE DB
function addTodo(title, completed) {
	let transaction = db.transaction(["todo"], "readwrite");
	let store = transaction.objectStore("todo");
	let request = store.add({ title, completed });

	request.onsuccess = () => displayTodos();
	request.onerror = (e) => console.error("Error adding todo: ", e.target.error);
}

// UPDATING TODO IN DB
function updateTodo(id, updatedTodo) {
	let transaction = db.transaction(["todo"], "readwrite");
	let store = transaction.objectStore("todo");
	let request = store.get(id);

	request.onsuccess = function (e) {
		let data = e.target.result;
		data.title = updatedTodo.title;
		data.completed = updatedTodo.completed;

		let updateRequest = store.put(data);
		updateRequest.onsuccess = () => displayTodos();
		updateRequest.onerror = (e) =>
			console.error("Error updating todo: ", e.target.error);
	};

	request.onerror = (e) =>
		console.error("Error retrieving todo: ", e.target.error);
}

// DELETING TODO
function deleteTodo(id) {
	let transaction = db.transaction(["todo"], "readwrite");
	let store = transaction.objectStore("todo");
	let request = store.delete(id);

	request.onsuccess = () => displayTodos();
	request.onerror = (e) =>
		console.error("Error deleting todo: ", e.target.error);
}

// DISPLAYING TODOS
function displayTodos() {
	let transaction = db.transaction(["todo"], "readonly");
	let store = transaction.objectStore("todo");
	let request = store.getAll();

	request.onsuccess = function (e) {
		let todos = e.target.result;
		let todoList = document.getElementById("todoList");
		todoList.innerHTML = "";
		todos.forEach((todo) => {
			let li = document.createElement("li");
			li.className = "todo-item";
			li.innerHTML = `
				<span>${todo.title}</span>
				<div>
					<button class="edit" onclick="editTodo(${todo.id})">Edit</button>
					<button onclick="deleteTodo(${todo.id})">Delete</button>
				</div>
			`;
			todoList.appendChild(li);
		});
	};

	request.onerror = (e) =>
		console.error("Error retrieving todos: ", e.target.error);
}

// EDITING TODO
function editTodo(id) {
	let newTitle = prompt("Enter new title:");
	if (newTitle) {
		let transaction = db.transaction(["todo"], "readwrite");
		let store = transaction.objectStore("todo");
		let request = store.get(id);

		request.onsuccess = function (e) {
			let data = e.target.result;
			data.title = newTitle;

			let updateRequest = store.put(data);
			updateRequest.onsuccess = () => displayTodos();
			updateRequest.onerror = (e) =>
				console.error("Error updating todo: ", e.target.error);
		};

		request.onerror = (e) =>
			console.error("Error retrieving todo: ", e.target.error);
	}
}

// FILTER TODO
function filterTodos(query) {
	let transaction = db.transaction(["todo"], "readonly");
	let store = transaction.objectStore("todo");
	let request = store.getAll();

	request.onsuccess = function (e) {
		let todos = e.target.result;
		let todoList = document.getElementById("todoList");
		todoList.innerHTML = "";
		todos.forEach((todo) => {
			if (todo.title.toLowerCase().includes(query)) {
				let li = document.createElement("li");
				li.className = "todo-item";
				li.innerHTML = `
					<span>${todo.title}</span>
					<div>
						<button class="edit" onclick="editTodo(${todo.id})">Edit</button>
						<button onclick="deleteTodo(${todo.id})">Delete</button>
					</div>
				`;
				todoList.appendChild(li);
			}
		});
	};

	request.onerror = (e) =>
		console.error("Error retrieving todos: ", e.target.error);
}
