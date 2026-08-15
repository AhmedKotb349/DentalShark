const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'dentalshark-db.json')
  : path.join(__dirname, 'data', 'db.json');

const INITIAL_USERS = [
  { _id: "owner_id", uid:"owner", name:"Eng. Ahmed Kotb", email:"ahmed.kotb@dentalshark.eg", password:"Admin@Shark2024!", role:"CEO", dept:"CEO & Admin", phone:"+20 100 123 4567", initials:"AK", color:"linear-gradient(135deg,#1d4ed8,#3b82f6)", orders:42, spent:"EGP 280,000", joined:"Jan 2022", sharkPts:504 },
  { _id: "eng_id", uid:"eng", name:"Eng. Mohamed Kotb", email:"m.kotb@dentalshark.eg", password:"Eng#Repair2024", role:"Engineer", dept:"Head Engineer & Repairing", phone:"+20 101 234 5678", initials:"MK", color:"linear-gradient(135deg,#7c3aed,#a855f7)", orders:0, spent:"—", joined:"Jan 2022", sharkPts:0 },
  { _id: "v1_id", uid:"v1", name:"Eng. Mohamed Gomaa", email:"m.gomaa@dentalshark.eg", password:"Vendor@Supply24", role:"Vendor", dept:"Handpieces Supply Partner", phone:"+20 102 345 6789", initials:"MG", color:"linear-gradient(135deg,#059669,#10b981)", orders:0, spent:"—", joined:"Mar 2022", sharkPts:0 },
  { _id: "v2_id", uid:"v2", name:"Eng. Ahmed Sedky", email:"a.sedky@dentalshark.eg", password:"Sterile#2024!", role:"Vendor", dept:"Sterilization Supply Partner", phone:"+20 103 456 7890", initials:"AS", color:"linear-gradient(135deg,#d97706,#f59e0b)", orders:0, spent:"—", joined:"Jun 2022", sharkPts:0 },
  { _id: "d1_id", uid:"d1", name:"Dr. Ashraf Elsokary", email:"dr.ashraf@clinic.eg", password:"Doctor@Ash2024", role:"Doctor", dept:"Senior Dental Consultant", phone:"+20 104 567 8901", initials:"AE", color:"linear-gradient(135deg,#db2777,#f472b6)", orders:18, spent:"EGP 45,000", joined:"Feb 2023", sharkPts:216 },
  { _id: "d2_id", uid:"d2", name:"Dr. Nader Mersal", email:"dr.nader@clinic.eg", password:"Ortho#Nad2024!", role:"Doctor", dept:"Orthodontist Specialist", phone:"+20 105 678 9012", initials:"NM", color:"linear-gradient(135deg,#0891b2,#22d3ee)", orders:24, spent:"EGP 62,000", joined:"Apr 2023", sharkPts:288 },
  { _id: "ad1_id", uid:"ad1", name:"David Samir", email:"d.samir@dentalshark.eg", password:"Staff@David24!", role:"Staff", dept:"Inventory Manager", phone:"+20 106 789 0123", initials:"DS", color:"linear-gradient(135deg,#7c3aed,#ec4899)", orders:0, spent:"—", joined:"Mar 2022", sharkPts:0 },
  { _id: "ad2_id", uid:"ad2", name:"Omar Essam", email:"o.essam@dentalshark.eg", password:"Student#Omar24", role:"Student", dept:"Logistics Intern", phone:"+20 107 890 1234", initials:"OE", color:"linear-gradient(135deg,#3b82f6,#2dd4bf)", orders:0, spent:"—", joined:"Apr 2022", sharkPts:0 },
  { _id: "guest_id", uid:"guest", name:"Guest User", email:"guest@dentalshark.eg", password:null, role:"Guest", dept:"Visitor", phone:"—", initials:"GU", color:"#64748b", orders:0, spent:"—", joined:"Apr 2026", sharkPts:0 }
];

const INITIAL_PRODUCTS = [
  {id:1, pid:1, name:"Tetric N-Ceram Composite 3.5g", brand:"Ivoclar Vivadent", cat:"RESTORATIVE", cat2:"Restorative", price:1250, old:1490, badge:"sale", rating:4.8, rev:98, pts:125, img:"https://th.bing.com/th/id/OIP.VWEs7OeSvwIwna0uAeFaZwHaGE?w=229&h=196&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Light-cured nano-hybrid composite for anterior and posterior restorations with excellent aesthetics, durability, and natural shade matching."},
  {id:2, pid:2, name:"Neo Spectra ST LV Composite 3g", brand:"Dentsply Sirona", cat:"RESTORATIVE", cat2:"Restorative", price:1575, old:1850, badge:"hot", rating:4.7, rev:76, pts:157, img:"https://th.bing.com/th/id/OIP.WAttaUiM9h9s5tkP6Kv_gQHaHa?w=195&h=195&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Universal nano-ceramic composite with SphereTEC filler technology for superior handling and polish."},
  {id:3, pid:3, name:"NSK Pana-Max Plus Turbine", brand:"NSK", cat:"HANDPIECES", cat2:"Handpieces", price:3850, old:4500, badge:"new", rating:4.9, rev:42, pts:385, img:"https://tse2.mm.bing.net/th/id/OIP.xYoV5VBe89iqOxlatXKCSwHaHa?pid=ImgDet&w=202&h=202&c=7&dpr=2&o=7&rm=3", desc:"High-speed air turbine with ceramic bearings and anti-retraction valve for enhanced durability."},
  {id:4, pid:4, name:"Cavitron 300 Ultrasonic Scaler", brand:"Dentsply Sirona", cat:"PERIODONTICS", cat2:"Periodontics", price:42000, old:48000, badge:"sale", rating:4.9, rev:15, pts:4200, img:"https://th.bing.com/th/id/OIP.9CZykMaBkwfiscyDh0vIhgHaE7?w=281&h=188&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Advanced digital ultrasonic scaling system with Steri-Mate 360 handpiece and wireless pedal."},
  {id:5, pid:5, name:"Eighteeth E-Connect S Endo Motor", brand:"Eighteeth", cat:"ENDODONTICS", cat2:"Endodontics", price:9800, old:11500, badge:"hot", rating:4.7, rev:28, pts:980, img:"https://th.bing.com/th/id/OIP.SrDfdBbFkdBblqcID22sPAHaHZ?w=171&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Cordless endodontic motor with built-in apex locator and multi-program settings."},
  {id:6, pid:6, name:"Mocom B Futura Autoclave 22L", brand:"Mocom", cat:"STERILIZATION", cat2:"Sterilization", price:85000, old:92000, badge:"new", rating:4.9, rev:12, pts:8500, img:"https://th.bing.com/th/id/OIP.koNOwKLA50dGIsNu3VJZJwHaFj?w=258&h=194&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Premium Class B steam sterilizer with Wi-Fi connectivity and integrated water sensor."},
  {id:7, pid:7, name:"Woodpecker i-Sensor H1", brand:"Woodpecker", cat:"IMAGING", cat2:"Imaging", price:14500, old:16000, badge:"sale", rating:4.6, rev:34, pts:1450, img:"https://tse2.mm.bing.net/th/id/OIP.4ia4LH5Y3jr8EXfnz9GMcAHaHa?pid=ImgDet&w=202&h=202&c=7&dpr=2&o=7&rm=3", desc:"High-definition intraoral digital X-ray sensor with ultra-slim design for patient comfort."},
  {id:8, pid:8, name:"KaVo Primus 1058 Life", brand:"KaVo", cat:"DENTAL UNITS", cat2:"Dental Units", price:245000, old:270000, badge:"hot", rating:4.9, rev:8, pts:24500, img:"https://th.bing.com/th/id/OIP.fsiqwbZYkZdi4davFzUsgQHaEK?w=297&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Ergonomic dental chair with high-quality upholstery and integrated hygiene functions."},
  {id:9, pid:9, name:"3M Filtek Z350 XT Composite", brand:"3M ESPE", cat:"RESTORATIVE", cat2:"Restorative", price:1450, old:1600, badge:"new", rating:4.9, rev:112, pts:145, img:"https://th.bing.com/th/id/OIP.t85XC-d_3kUAR5zSOCqHLQHaHa?w=201&h=201&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Premium universal nanocomposite with excellent wear resistance and polish retention."},
  {id:10, pid:10, name:"NSK Ti-Max Z95L Contra-Angle", brand:"NSK", cat:"HANDPIECES", cat2:"Handpieces", price:15200, old:17500, badge:"hot", rating:5.0, rev:45, pts:1520, img:"https://blog.confidental.org/wp-content/uploads/2024/06/NSK-Ti-MAX-Z95L-1024x576.png", desc:"1:5 increasing contra-angle handpiece with titanium body and cellular glass optics."},
  {id:11, pid:11, name:"Woodpecker Endo Radar Plus", brand:"Woodpecker", cat:"ENDODONTICS", cat2:"Endodontics", price:12500, old:14000, badge:"sale", rating:4.8, rev:64, pts:1250, img:"https://tse2.mm.bing.net/th/id/OIP.QFAHmfoktISJh0kXsUqHEwHaHa?pid=ImgDet&w=202&h=202&c=7&dpr=2&o=7&rm=3", desc:"Wireless endo motor with integrated apex locator, supporting reciprocating and rotary motion."},
  {id:12, pid:12, name:"KaVo Kerr SonicFill 3", brand:"KaVo Kerr", cat:"RESTORATIVE", cat2:"Restorative", price:8900, old:9500, badge:"new", rating:4.7, rev:39, pts:890, img:"https://th.bing.com/th/id/OIP.sXYU6QHA5R_ACe1S_SgsAwHaGf?w=193&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Advanced sonic-activated bulk fill system for fast and void-free restorations."},
  {id:13, pid:13, name:"Dentsply Propex Pixi", brand:"Dentsply Sirona", cat:"ENDODONTICS", cat2:"Endodontics", price:7400, old:8200, badge:"hot", rating:4.9, rev:51, pts:740, img:"https://th.bing.com/th/id/OIP.pIsuycSCQNzd6E8JclKQWAHaHa?w=177&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Miniature apex locator that fits in your pocket, accurate in both wet and dry canals."},
  {id:14, pid:14, name:"W&H Lina Autoclave 22L", brand:"W&H", cat:"STERILIZATION", cat2:"Sterilization", price:92000, old:105000, badge:"sale", rating:5.0, rev:19, pts:9200, img:"https://th.bing.com/th/id/OIP.pOJrW93ZT5Utxvwjo3J31wHaHa?w=193&h=193&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Reliable Class B sterilizer with Eco Dry technology and low water consumption."},
  {id:15, pid:15, name:"KaVo Mastertorque M9000L", brand:"KaVo", cat:"HANDPIECES", cat2:"Handpieces", price:18500, old:21000, badge:"new", rating:4.9, rev:24, pts:1850, img:"https://th.bing.com/th/id/OIP.yViZBp68qmO77JZ-rwN89AHaHa?w=187&h=187&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"High-end turbine with Direct Stop Technology and silent operation."},
  {id:16, pid:16, name:"Meta Biomed EQ-V Fill", brand:"Meta Biomed", cat:"ENDODONTICS", cat2:"Endodontics", price:11200, old:13000, badge:"hot", rating:4.8, rev:18, pts:1120, img:"https://th.bing.com/th/id/OIP.TghORw7OYJZZZDzNHEDu0gHaHa?w=162&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Gutta-percha obturation system for precise root canal filling."},
  {id:17, pid:17, name:"Tokuyama Estelite Sigma Quick", brand:"Tokuyama Dental", cat:"RESTORATIVE", cat2:"Restorative", price:1150, old:1350, badge:"sale", rating:4.9, rev:56, pts:115, img:"https://thfvnext.bing.com/th/id/OIP.T0i8oWjf2ipR1N4mRBsndgHaGq?w=206&h=186&c=7&r=0&o=7&cb=thfvnextfalcon&dpr=2&pid=1.7&rm=3", desc:"Quick-curing universal composite with outstanding polishability."},
  {id:18, pid:18, name:"NSK Surgic Pro Optic", brand:"NSK", cat:"SURGICAL", cat2:"Surgical", price:72000, old:80000, badge:"new", rating:5.0, rev:11, pts:7200, img:"https://th.bing.com/th/id/OIP.D4HokRF6NcDg0Dfwu8qsbgHaEK?w=324&h=182&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Micromotor system for oral surgery and dental implants with LED optics."},
  {id:19, pid:19, name:"Promedica N-Fill Flow", brand:"Promedica", cat:"RESTORATIVE", cat2:"Restorative", price:650, old:850, badge:"hot", rating:4.7, rev:41, pts:65, img:"https://tse4.mm.bing.net/th/id/OIP.Pr06ArbSv7y_i_N3e56ksQAAAA?pid=ImgDet&w=202&h=105&c=7&dpr=2&o=7&rm=3", desc:"Light-cured flowable restorative composite for minimal intervention."},
  {id:20, pid:20, name:"Dentsply Aquasil Soft Putty", brand:"Dentsply Sirona", cat:"RESTORATIVE", cat2:"Restorative", price:1950, old:2200, badge:"sale", rating:4.8, rev:29, pts:195, img:"https://th.bing.com/th/id/OIP.57b1PbtLgOOJwBFVAHYLjwHaE7?w=266&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Premium silicone impression material for highly accurate restorations."}
];

// Initialize database with default structure if it doesn't exist
function initDB() {
  const dataDir = path.dirname(dbPath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  let needsWrite = false;
  let currentData = { users: [], products: [], orders: [], suppliers: [] };

  if (fs.existsSync(dbPath)) {
    try {
      currentData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (_) {
      needsWrite = true;
    }
  } else {
    needsWrite = true;
  }

  // Self-seed users if none exist
  if (!currentData.users || currentData.users.length === 0) {
    console.log("Seeding default users to database...");
    currentData.users = INITIAL_USERS.map(user => {
      const u = { ...user };
      if (u.password) {
        // synchronously hash passwords for immediate availability
        const salt = bcrypt.genSaltSync(10);
        u.password = bcrypt.hashSync(u.password, salt);
      }
      return u;
    });
    needsWrite = true;
  } else {
    // Ensure 'guest' user is present
    const hasGuest = currentData.users.some(u => u.uid === 'guest');
    if (!hasGuest) {
      console.log("Ensuring guest user presence in database...");
      const guestObj = INITIAL_USERS.find(u => u.uid === 'guest') || {
        _id: "guest_id",
        uid: "guest",
        name: "Guest User",
        email: "guest@dentalshark.eg",
        password: null,
        role: "Guest",
        dept: "Visitor",
        phone: "—",
        initials: "GU",
        color: "#64748b",
        orders: 0,
        spent: "—",
        joined: "Apr 2026",
        sharkPts: 0
      };
      currentData.users.push(guestObj);
      needsWrite = true;
    }
  }

  // Self-seed products if none exist
  if (!currentData.products || currentData.products.length === 0) {
    console.log("Seeding default products to database...");
    currentData.products = INITIAL_PRODUCTS;
    needsWrite = true;
  } else {
    // SELF-HEAL: repair any product image left over from an older run of this app that
    // pointed at a local bundled icon instead of the real product photo URL below.
    const PID_TO_IMG = {};
    INITIAL_PRODUCTS.forEach((p) => { PID_TO_IMG[p.pid] = p.img; });
    let healed = 0;
    currentData.products = currentData.products.map((p) => {
      const canonical = PID_TO_IMG[p.pid];
      const isStale = typeof p.img === 'string' && p.img.startsWith('/products/');
      if (canonical && (isStale || !p.img)) {
        healed++;
        return { ...p, img: canonical };
      }
      return p;
    });
    // also heal stale order line-item images (e.g. seeded historical orders)
    (currentData.orders || []).forEach((o) => {
      (o.items || []).forEach((it) => {
        if (typeof it.img === 'string' && it.img.startsWith('/products/')) {
          const match = currentData.products.find((p) => p.id === it.productId || p.pid === it.productId);
          if (match) { it.img = match.img; healed++; }
        }
      });
    });
    if (healed > 0) {
      console.log(`Healed ${healed} product/order image(s) that were pointing at a stale local icon.`);
      needsWrite = true;
    }
  }

  // Self-seed suppliers if none exist
  if (!currentData.suppliers || currentData.suppliers.length === 0) {
    currentData.suppliers = [
      { _id: "s1", name: "Al-Ahram Dental Supplies", contact: "ahram@dental.eg | +201011223344", productsSupplied: "Dental Chairs, Micromotors, Autoclaves" },
      { _id: "s2", name: "Sina Orthodontic Materials", contact: "info@sina-ortho.eg | +201122334455", productsSupplied: "Brackets, Wires, Aligner sheets" },
      { _id: "s3", name: "Egypt Dent Max", contact: "supply@sharkdental.eg | +201201234567", productsSupplied: "AI Scanners, Handpieces, Resin polymers" }
    ];
    needsWrite = true;
  }

  // Self-seed sample orders if none exist
  if (!currentData.orders || currentData.orders.length === 0) {
    const drAshraf = currentData.users.find(u => u.uid === 'd1') || currentData.users[0];
    const drNader = currentData.users.find(u => u.uid === 'd2') || currentData.users[0];
    const owner = currentData.users.find(u => u.uid === 'owner') || currentData.users[0];

    currentData.orders = [
      { _id: "101", orderId:'#DS-44821', userId:drAshraf._id, items:[{productId:1,name:INITIAL_PRODUCTS[0].name,brand:INITIAL_PRODUCTS[0].brand,price:INITIAL_PRODUCTS[0].price,qty:2,img:INITIAL_PRODUCTS[0].img,pts:INITIAL_PRODUCTS[0].pts}], subtotal:2500, shipping:150, total:2650, status:'Delivered', ptsEarned:250, paymentMethod:'COD', trackingId:'TRK-DS44821', estimatedDelivery:'Jan 18 – Jan 20, 2025', createdAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
      { _id: "102", orderId:'#DS-44822', userId:drAshraf._id, items:[{productId:3,name:INITIAL_PRODUCTS[2].name,brand:INITIAL_PRODUCTS[2].brand,price:INITIAL_PRODUCTS[2].price,qty:1,img:INITIAL_PRODUCTS[2].img,pts:INITIAL_PRODUCTS[2].pts}], subtotal:3850, shipping:150, total:4000, status:'Shipped', ptsEarned:385, paymentMethod:'Card', trackingId:'TRK-DS44822', estimatedDelivery:'Feb 2 – Feb 4, 2025', createdAt: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
      { _id: "103", orderId:'#DS-44823', userId:drNader._id, items:[{productId:7,name:INITIAL_PRODUCTS[6].name || 'Sensor',brand:INITIAL_PRODUCTS[6].brand || 'Woodpecker',price:INITIAL_PRODUCTS[6].price || 14500,qty:1,img:INITIAL_PRODUCTS[6].img || '',pts:1450}], subtotal:14500, shipping:0, total:14500, status:'Delivered', ptsEarned:1450, paymentMethod:'InstaPay', trackingId:'TRK-DS44823', estimatedDelivery:'Jan 25 – Jan 27, 2025', createdAt: new Date(Date.now() - 10*24*60*60*1000).toISOString() },
      { _id: "104", orderId:'#DS-44824', userId:owner._id, items:[{productId:8,name:INITIAL_PRODUCTS[7].name || 'Chair',brand:INITIAL_PRODUCTS[7].brand || 'Kavo',price:INITIAL_PRODUCTS[7].price || 245000,qty:1,img:INITIAL_PRODUCTS[7].img || '',pts:24500}], subtotal:245000, shipping:0, total:245000, status:'Pending', ptsEarned:24500, paymentMethod:'Wallet', trackingId:'TRK-DS44824', estimatedDelivery:'Feb 10 – Feb 12, 2025', createdAt: new Date().toISOString() }
    ];
    needsWrite = true;
  }

  if (needsWrite) {
    fs.writeFileSync(dbPath, JSON.stringify(currentData, null, 2));
    console.log("Database initialized & seeded successfully!");
  }
}

// Read whole database
function readDB() {
  initDB();
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

// Write whole database
function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const db = {
  users: {
    find: (query = {}) => {
      const data = readDB();
      return (data.users || []).filter(u => {
        return Object.keys(query).every(k => u[k] === query[k]);
      });
    },
    findOne: (query) => {
      const data = readDB();
      return (data.users || []).find(u => {
        return Object.keys(query).every(k => u[k] === query[k]);
      });
    },
    findById: (id) => {
      const data = readDB();
      return (data.users || []).find(u => u._id === id);
    },
    insert: async (user) => {
      const data = readDB();
      user._id = Date.now().toString(); // Simulate ObjectId
      
      // Hash password if present
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
      
      if (!data.users) data.users = [];
      data.users.push(user);
      writeDB(data);
      return user;
    },
    update: (id, updates) => {
      const data = readDB();
      const idx = data.users.findIndex(u => u._id === id);
      if (idx !== -1) {
        data.users[idx] = { ...data.users[idx], ...updates };
        writeDB(data);
        return data.users[idx];
      }
      return null;
    },
    delete: (id) => {
      const data = readDB();
      const idx = data.users.findIndex(u => u._id === id);
      if (idx !== -1) {
        const deleted = data.users.splice(idx, 1)[0];
        writeDB(data);
        return deleted;
      }
      return null;
    },
    comparePassword: async (candidatePassword, userPassword) => {
      if (!userPassword) return false;
      return bcrypt.compare(candidatePassword, userPassword);
    },
    toProfile: (user) => {
      const obj = { ...user };
      delete obj.password;
      return obj;
    }
  },
  products: {
    find: (query = {}) => {
      const data = readDB();
      return data.products || [];
    },
    findById: (id) => {
      const data = readDB();
      return (data.products || []).find(p => p.id === Number(id) || p.pid === Number(id));
    },
    insertMany: (products) => {
      const data = readDB();
      data.products = products;
      writeDB(data);
    },
    insert: (product) => {
      const data = readDB();
      if (!data.products) data.products = [];
      const nextId = data.products.reduce((max, p) => Math.max(max, p.id || p.pid || 0), 0) + 1;
      const newProduct = { ...product, id: nextId, pid: nextId };
      data.products.push(newProduct);
      writeDB(data);
      return newProduct;
    },
    update: (id, updates) => {
      const data = readDB();
      const idx = (data.products || []).findIndex(p => p.id === Number(id) || p.pid === Number(id));
      if (idx !== -1) {
        data.products[idx] = { ...data.products[idx], ...updates };
        writeDB(data);
        return data.products[idx];
      }
      return null;
    },
    delete: (id) => {
      const data = readDB();
      const idx = (data.products || []).findIndex(p => p.id === Number(id) || p.pid === Number(id));
      if (idx !== -1) {
        const deleted = data.products.splice(idx, 1)[0];
        writeDB(data);
        return deleted;
      }
      return null;
    }
  },
  bookings: {
    find: (query = {}) => {
      const data = readDB();
      return (data.bookings || []).filter(b => {
        return Object.keys(query).every(k => b[k] === query[k]);
      });
    },
    insert: (booking) => {
      const data = readDB();
      if (!data.bookings) data.bookings = [];
      booking._id = Date.now().toString();
      booking.createdAt = new Date().toISOString();
      booking.status = booking.status || 'Pending';
      data.bookings.push(booking);
      writeDB(data);
      return booking;
    },
    update: (id, updates) => {
      const data = readDB();
      const idx = (data.bookings || []).findIndex(b => b._id === id);
      if (idx !== -1) {
        data.bookings[idx] = { ...data.bookings[idx], ...updates };
        writeDB(data);
        return data.bookings[idx];
      }
      return null;
    },
    delete: (id) => {
      const data = readDB();
      const idx = (data.bookings || []).findIndex(b => b._id === id);
      if (idx !== -1) {
        const deleted = data.bookings.splice(idx, 1)[0];
        writeDB(data);
        return deleted;
      }
      return null;
    }
  },
  orders: {
    find: (query = {}) => {
      const data = readDB();
      return (data.orders || []).filter(o => {
        return Object.keys(query).every(k => o[k] === query[k]);
      });
    },
    findOne: (query) => {
      const data = readDB();
      return (data.orders || []).find(o => {
        return Object.keys(query).every(k => o[k] === query[k]);
      });
    },
    insert: (order) => {
      const data = readDB();
      order._id = Date.now().toString();
      order.createdAt = new Date().toISOString();
      if (!data.orders) data.orders = [];
      data.orders.push(order);
      writeDB(data);
      return order;
    },
    update: (id, updates) => {
      const data = readDB();
      const idx = data.orders.findIndex(o => o._id === id);
      if (idx !== -1) {
        data.orders[idx] = { ...data.orders[idx], ...updates };
        writeDB(data);
        return data.orders[idx];
      }
      return null;
    },
    delete: (id) => {
      const data = readDB();
      const idx = data.orders.findIndex(o => o._id === id);
      if (idx !== -1) {
        const deleted = data.orders.splice(idx, 1)[0];
        writeDB(data);
        return deleted;
      }
      return null;
    }
  },
  suppliers: {
    find: (query = {}) => {
      const data = readDB();
      return (data.suppliers || []).filter(s => {
        return Object.keys(query).every(k => s[k] === query[k]);
      });
    },
    findOne: (query) => {
      const data = readDB();
      return (data.suppliers || []).find(s => {
        return Object.keys(query).every(k => s[k] === query[k]);
      });
    },
    findById: (id) => {
      const data = readDB();
      return (data.suppliers || []).find(s => s._id === id);
    },
    insert: (supplier) => {
      const data = readDB();
      if (!data.suppliers) data.suppliers = [];
      supplier._id = Date.now().toString();
      data.suppliers.push(supplier);
      writeDB(data);
      return supplier;
    },
    update: (id, updates) => {
      const data = readDB();
      if (!data.suppliers) data.suppliers = [];
      const idx = data.suppliers.findIndex(s => s._id === id);
      if (idx !== -1) {
        data.suppliers[idx] = { ...data.suppliers[idx], ...updates };
        writeDB(data);
        return data.suppliers[idx];
      }
      return null;
    },
    delete: (id) => {
      const data = readDB();
      if (!data.suppliers) data.suppliers = [];
      const idx = data.suppliers.findIndex(s => s._id === id);
      if (idx !== -1) {
        const deleted = data.suppliers.splice(idx, 1)[0];
        writeDB(data);
        return deleted;
      }
      return null;
    }
  }
};

module.exports = db;
