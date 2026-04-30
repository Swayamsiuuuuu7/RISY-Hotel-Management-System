// LOGIN
function login() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("appPage").style.display = "flex";
}

// ROOM PRICES
const roomPrices = {
  Single: 1000,
  Double: 2000,
  Suite: 5000
};

// ROOM LIMITS
const roomLimits = {
  Single: 20,
  Double: 20,
  Suite: 10
};

// AUTO PRICE
function setPrice() {
  let type = document.getElementById("roomType").value;
  document.getElementById("price").value = roomPrices[type] || "";
}

// BOOK ROOM
async function bookRoom() {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;
  let type = document.getElementById("roomType").value;
  let price = document.getElementById("price").value;

  if (!name || !email || !phone || !type) {
    popup("Fill all details ❌");
    return;
  }

  const { data } = await supabaseClient.from("bookings").select("*");

  let count = data.filter(b => b.room_type === type).length;

  if (count >= roomLimits[type]) {
    popup(type + " rooms full ❌");
    return;
  }

  const { error } = await supabaseClient
    .from("bookings")
    .insert([
      {
        name,
        email,
        phone,
        room_type: type,
        price
      }
    ]);

  if (error) {
    console.log(error);
    popup("Error saving data ❌");
    return;
  }

  popup("Room Booked Successfully ✅");

  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("roomType").value = "";
  document.getElementById("price").value = "";

  updateDashboard();
}

// DELETE
async function deleteBooking(id) {
  const { error } = await supabaseClient
    .from("bookings")
    .delete()
    .eq("id", id);

  if (error) {
    console.log(error);
    return;
  }

  popup("Booking Deleted ❌");
  showGuestLog();
  updateDashboard();
}

// EDIT BOOKING
async function editBooking(id, name, email, phone, room) {
  let newName = prompt("Edit Name:", name);
  let newEmail = prompt("Edit Email:", email);
  let newPhone = prompt("Edit Phone:", phone);
  let newRoom = prompt("Edit Room (Single/Double/Suite):", room);

  if (!newName || !newEmail || !newPhone || !newRoom) return;

  newRoom = newRoom.trim();

  const { data } = await supabaseClient.from("bookings").select("*");

  let count = data.filter(b => b.room_type === newRoom && b.id !== id).length;

  if (count >= roomLimits[newRoom]) {
    popup(newRoom + " rooms full ❌");
    return;
  }

  let newPrice = roomPrices[newRoom];

  const { error } = await supabaseClient
    .from("bookings")
    .update({
      name: newName,
      email: newEmail,
      phone: newPhone,
      room_type: newRoom,
      price: newPrice
    })
    .eq("id", id);

  if (error) {
    console.log(error);
    return;
  }

  popup("Booking Updated ✅");
  showGuestLog();
  updateDashboard();
}

// 🔥 UPDATED DASHBOARD (WITH ROOM TYPES)
async function updateDashboard() {
  const { data } = await supabaseClient.from("bookings").select("*");

  let totalRooms = 20 + 20 + 10;
  let bookedRooms = data.length;

  // COUNT EACH TYPE
  let single = data.filter(b => b.room_type === "Single").length;
  let double = data.filter(b => b.room_type === "Double").length;
  let suite = data.filter(b => b.room_type === "Suite").length;

  // MAIN STATS
  document.getElementById("bookedRooms").innerText = bookedRooms;
  document.getElementById("availableRooms").innerText = totalRooms - bookedRooms;

  // 🔥 ROOM TYPE STATS (SAFE CHECK)
  if (document.getElementById("singleLeft")) {
    document.getElementById("singleLeft").innerText = roomLimits.Single - single;
  }

  if (document.getElementById("doubleLeft")) {
    document.getElementById("doubleLeft").innerText = roomLimits.Double - double;
  }

  if (document.getElementById("suiteLeft")) {
    document.getElementById("suiteLeft").innerText = roomLimits.Suite - suite;
  }
}

// NAVIGATION
function showDashboard() {
  document.getElementById("dashboardPage").style.display = "block";
  document.getElementById("bookingPage").style.display = "none";
  document.getElementById("guestPage").style.display = "none";

  updateDashboard();
}

function showBooking() {
  document.getElementById("dashboardPage").style.display = "none";
  document.getElementById("bookingPage").style.display = "block";
  document.getElementById("guestPage").style.display = "none";
}

// SHOW GUEST LOG
async function showGuestLog() {
  document.getElementById("dashboardPage").style.display = "none";
  document.getElementById("bookingPage").style.display = "none";
  document.getElementById("guestPage").style.display = "block";

  let output = document.getElementById("output");

  const { data, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

  output.innerHTML = "";

  data.forEach((b, i) => {
    output.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${b.name}</td>
        <td>${b.email}</td>
        <td>${b.phone}</td>
        <td>${b.room_type}</td>
        <td>₹${b.price}</td>
        <td>
          <button onclick="editBooking('${b.id}', '${b.name}', '${b.email}', '${b.phone}', '${b.room_type}')">Edit</button>
          <button class="delete-btn" onclick="deleteBooking('${b.id}')">Delete</button>
        </td>
      </tr>
    `;
  });

  if (data.length === 0) {
    output.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">No Data</td>
      </tr>
    `;
  }
}

// POPUP
function popup(message) {
  const popup = document.getElementById("popup");
  const text = document.getElementById("popupText");

  text.innerText = message;
  popup.style.display = "flex";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2000);
}

// INITIAL LOAD
updateDashboard();