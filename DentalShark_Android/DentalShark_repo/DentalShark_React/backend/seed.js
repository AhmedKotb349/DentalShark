const db = require('./jsonDb');
const USERS = [
  { uid:"owner", name:"Eng. Ahmed Kotb", email:"ahmed.kotb@dentalshark.eg", password:"Admin@Shark2024!", role:"CEO", dept:"CEO & Admin", phone:"+20 100 123 4567", initials:"AK", color:"linear-gradient(135deg,#1d4ed8,#3b82f6)", orders:42, spent:"EGP 280,000", joined:"Jan 2022", sharkPts:504 },
  { uid:"eng", name:"Eng. Mohamed Kotb", email:"m.kotb@dentalshark.eg", password:"Eng#Repair2024", role:"Engineer", dept:"Head Engineer & Repairing", phone:"+20 101 234 5678", initials:"MK", color:"linear-gradient(135deg,#7c3aed,#a855f7)", orders:0, spent:"—", joined:"Jan 2022", sharkPts:0 },
  { uid:"v1", name:"Eng. Mohamed Gomaa", email:"m.gomaa@dentalshark.eg", password:"Vendor@Supply24", role:"Vendor", dept:"Handpieces Supply Partner", phone:"+20 102 345 6789", initials:"MG", color:"linear-gradient(135deg,#059669,#10b981)", orders:0, spent:"—", joined:"Mar 2022", sharkPts:0 },
  { uid:"v2", name:"Eng. Ahmed Sedky", email:"a.sedky@dentalshark.eg", password:"Sterile#2024!", role:"Vendor", dept:"Sterilization Supply Partner", phone:"+20 103 456 7890", initials:"AS", color:"linear-gradient(135deg,#d97706,#f59e0b)", orders:0, spent:"—", joined:"Jun 2022", sharkPts:0 },
  { uid:"d1", name:"Dr. Ashraf Elsokary", email:"dr.ashraf@clinic.eg", password:"Doctor@Ash2024", role:"Doctor", dept:"Senior Dental Consultant", phone:"+20 104 567 8901", initials:"AE", color:"linear-gradient(135deg,#db2777,#f472b6)", orders:18, spent:"EGP 45,000", joined:"Feb 2023", sharkPts:216 },
  { uid:"d2", name:"Dr. Nader Mersal", email:"dr.nader@clinic.eg", password:"Ortho#Nad2024!", role:"Doctor", dept:"Orthodontist Specialist", phone:"+20 105 678 9012", initials:"NM", color:"linear-gradient(135deg,#0891b2,#22d3ee)", orders:24, spent:"EGP 62,000", joined:"Apr 2023", sharkPts:288 },
  { uid:"ad1", name:"David Samir", email:"d.samir@dentalshark.eg", password:"Staff@David24!", role:"Staff", dept:"Inventory Manager", phone:"+20 106 789 0123", initials:"DS", color:"linear-gradient(135deg,#7c3aed,#ec4899)", orders:0, spent:"—", joined:"Mar 2022", sharkPts:0 },
  { uid:"ad2", name:"Omar Essam", email:"o.essam@dentalshark.eg", password:"Student#Omar24", role:"Student", dept:"Logistics Intern", phone:"+20 107 890 1234", initials:"OE", color:"linear-gradient(135deg,#3b82f6,#2dd4bf)", orders:0, spent:"—", joined:"Apr 2022", sharkPts:0 },
  { uid:"guest", name:"Guest User", email:"guest@dentalshark.eg", password:null, role:"Guest", dept:"Visitor", phone:"—", initials:"GU", color:"#64748b", orders:0, spent:"—", joined:"Apr 2026", sharkPts:0 },
];

const PRODUCTS = [
  {pid:1, name:"Tetric N-Ceram Composite 3.5g", brand:"Ivoclar Vivadent", cat:"RESTORATIVE", cat2:"Restorative", price:1250, old:1490, badge:"sale", rating:4.8, rev:98, pts:125, img:"https://th.bing.com/th/id/OIP.VWEs7OeSvwIwna0uAeFaZwHaGE?w=229&h=196&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Light-cured nano-hybrid composite for anterior and posterior restorations with excellent aesthetics, durability, and natural shade matching."},
  {pid:2, name:"Neo Spectra ST LV Composite 3g", brand:"Dentsply Sirona", cat:"RESTORATIVE", cat2:"Restorative", price:1575, old:1850, badge:"hot", rating:4.7, rev:76, pts:157, img:"https://th.bing.com/th/id/OIP.WAttaUiM9h9s5tkP6Kv_gQHaHa?w=195&h=195&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Universal nano-ceramic composite with SphereTEC filler technology for superior handling and polish."},
  {pid:3, name:"NSK Pana-Max Plus Turbine", brand:"NSK", cat:"HANDPIECES", cat2:"Handpieces", price:3850, old:4500, badge:"new", rating:4.9, rev:42, pts:385, img:"https://tse2.mm.bing.net/th/id/OIP.xYoV5VBe89iqOxlatXKCSwHaHa?pid=ImgDet&w=202&h=202&c=7&dpr=2&o=7&rm=3", desc:"High-speed air turbine with ceramic bearings and anti-retraction valve for enhanced durability."},
  {pid:4, name:"Cavitron 300 Ultrasonic Scaler", brand:"Dentsply Sirona", cat:"PERIODONTICS", cat2:"Periodontics", price:42000, old:48000, badge:"sale", rating:4.9, rev:15, pts:4200, img:"https://th.bing.com/th/id/OIP.9CZykMaBkwfiscyDh0vIhgHaE7?w=281&h=188&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Advanced digital ultrasonic scaling system with Steri-Mate 360 handpiece and wireless pedal."},
  {pid:5, name:"Eighteeth E-Connect S Endo Motor", brand:"Eighteeth", cat:"ENDODONTICS", cat2:"Endodontics", price:9800, old:11500, badge:"hot", rating:4.7, rev:28, pts:980, img:"https://th.bing.com/th/id/OIP.SrDfdBbFkdBblqcID22sPAHaHZ?w=171&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Cordless endodontic motor with built-in apex locator and multi-program settings."},
  {pid:6, name:"Mocom B Futura Autoclave 22L", brand:"Mocom", cat:"STERILIZATION", cat2:"Sterilization", price:85000, old:92000, badge:"new", rating:4.9, rev:12, pts:8500, img:"https://th.bing.com/th/id/OIP.koNOwKLA50dGIsNu3VJZJwHaFj?w=258&h=194&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Premium Class B steam sterilizer with Wi-Fi connectivity and integrated water sensor."},
  {pid:7, name:"Woodpecker i-Sensor H1", brand:"Woodpecker", cat:"IMAGING", cat2:"Imaging", price:14500, old:16000, badge:"sale", rating:4.6, rev:34, pts:1450, img:"https://tse2.mm.bing.net/th/id/OIP.4ia4LH5Y3jr8EXfnz9GMcAHaHa?pid=ImgDet&w=202&h=202&c=7&dpr=2&o=7&rm=3", desc:"High-definition intraoral digital X-ray sensor with ultra-slim design for patient comfort."},
  {pid:8, name:"KaVo Primus 1058 Life", brand:"KaVo", cat:"DENTAL UNITS", cat2:"Dental Units", price:245000, old:270000, badge:"hot", rating:4.9, rev:8, pts:24500, img:"https://th.bing.com/th/id/OIP.fsiqwbZYkZdi4davFzUsgQHaEK?w=297&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Ergonomic dental chair with high-quality upholstery and integrated hygiene functions."},
  {pid:9, name:"3M Filtek Z350 XT Composite", brand:"3M ESPE", cat:"RESTORATIVE", cat2:"Restorative", price:1450, old:1600, badge:"new", rating:4.9, rev:112, pts:145, img:"https://th.bing.com/th/id/OIP.t85XC-d_3kUAR5zSOCqHLQHaHa?w=201&h=201&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Premium universal nanocomposite with excellent wear resistance and polish retention."},
  {pid:10, name:"NSK Ti-Max Z95L Contra-Angle", brand:"NSK", cat:"HANDPIECES", cat2:"Handpieces", price:15200, old:17500, badge:"hot", rating:5.0, rev:45, pts:1520, img:"https://blog.confidental.org/wp-content/uploads/2024/06/NSK-Ti-MAX-Z95L-1024x576.png", desc:"1:5 increasing contra-angle handpiece with titanium body and cellular glass optics."},
  {pid:11, name:"Woodpecker Endo Radar Plus", brand:"Woodpecker", cat:"ENDODONTICS", cat2:"Endodontics", price:12500, old:14000, badge:"sale", rating:4.8, rev:64, pts:1250, img:"https://tse2.mm.bing.net/th/id/OIP.QFAHmfoktISJh0kXsUqHEwHaHa?pid=ImgDet&w=202&h=202&c=7&dpr=2&o=7&rm=3", desc:"Wireless endo motor with integrated apex locator, supporting reciprocating and rotary motion."},
  {pid:12, name:"KaVo Kerr SonicFill 3", brand:"KaVo Kerr", cat:"RESTORATIVE", cat2:"Restorative", price:8900, old:9500, badge:"new", rating:4.7, rev:39, pts:890, img:"https://th.bing.com/th/id/OIP.sXYU6QHA5R_ACe1S_SgsAwHaGf?w=193&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Advanced sonic-activated bulk fill system for fast and void-free restorations."},
  {pid:13, name:"Dentsply Propex Pixi", brand:"Dentsply Sirona", cat:"ENDODONTICS", cat2:"Endodontics", price:7400, old:8200, badge:"hot", rating:4.9, rev:51, pts:740, img:"https://th.bing.com/th/id/OIP.pIsuycSCQNzd6E8JclKQWAHaHa?w=177&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Miniature apex locator that fits in your pocket, accurate in both wet and dry canals."},
  {pid:14, name:"W&H Lina Autoclave 22L", brand:"W&H", cat:"STERILIZATION", cat2:"Sterilization", price:92000, old:105000, badge:"sale", rating:5.0, rev:19, pts:9200, img:"https://th.bing.com/th/id/OIP.pOJrW93ZT5Utxvwjo3J31wHaHa?w=193&h=193&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Reliable Class B sterilizer with Eco Dry technology and low water consumption."},
  {pid:15, name:"KaVo Mastertorque M9000L", brand:"KaVo", cat:"HANDPIECES", cat2:"Handpieces", price:18500, old:21000, badge:"new", rating:4.9, rev:24, pts:1850, img:"https://th.bing.com/th/id/OIP.yViZBp68qmO77JZ-rwN89AHaHa?w=187&h=187&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"High-end turbine with Direct Stop Technology and silent operation."},
  {pid:16, name:"Meta Biomed EQ-V Fill", brand:"Meta Biomed", cat:"ENDODONTICS", cat2:"Endodontics", price:11200, old:13000, badge:"hot", rating:4.8, rev:18, pts:1120, img:"https://th.bing.com/th/id/OIP.TghORw7OYJZZZDzNHEDu0gHaHa?w=162&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Gutta-percha obturation system for precise root canal filling."},
  {pid:17, name:"Tokuyama Estelite Sigma Quick", brand:"Tokuyama Dental", cat:"RESTORATIVE", cat2:"Restorative", price:1150, old:1350, badge:"sale", rating:4.9, rev:56, pts:115, img:"https://thfvnext.bing.com/th/id/OIP.T0i8oWjf2ipR1N4mRBsndgHaGq?w=206&h=186&c=7&r=0&o=7&cb=thfvnextfalcon&dpr=2&pid=1.7&rm=3", desc:"Quick-curing universal composite with outstanding polishability."},
  {pid:18, name:"NSK Surgic Pro Optic", brand:"NSK", cat:"SURGICAL", cat2:"Surgical", price:72000, old:80000, badge:"new", rating:5.0, rev:11, pts:7200, img:"https://th.bing.com/th/id/OIP.D4HokRF6NcDg0Dfwu8qsbgHaEK?w=324&h=182&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Micromotor system for oral surgery and dental implants with LED optics."},
  {pid:19, name:"Promedica N-Fill Flow", brand:"Promedica", cat:"RESTORATIVE", cat2:"Restorative", price:650, old:850, badge:"hot", rating:4.7, rev:41, pts:65, img:"https://tse4.mm.bing.net/th/id/OIP.Pr06ArbSv7y_i_N3e56ksQAAAA?pid=ImgDet&w=202&h=105&c=7&dpr=2&o=7&rm=3", desc:"Light-cured flowable restorative composite for minimal intervention."},
  {pid:20, name:"Dentsply Aquasil Soft Putty", brand:"Dentsply Sirona", cat:"RESTORATIVE", cat2:"Restorative", price:1950, old:2200, badge:"sale", rating:4.8, rev:29, pts:195, img:"https://th.bing.com/th/id/OIP.57b1PbtLgOOJwBFVAHYLjwHaE7?w=266&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Premium silicone impression material for highly accurate restorations."},
];

async function seed() {
  try {
    // Idempotency guard: skip seeding if products already exist (e.g. container restart)
    const existingProducts = db.products.find({});
    if (existingProducts.length > 0) {
      console.log(`ℹ️  Database already seeded (${existingProducts.length} products found) — skipping.`);
      process.exit(0);
    }

    console.log('✅ Connected to JSON Database');

    // Clear existing data implicitly by writing over
    let seededUsers = [];
    // Seed users (passwords are auto-hashed by the JSON DB wrapper)
    for (const u of USERS) {
      const user = await db.users.insert(u);
      seededUsers.push(user);
      console.log(`  👤 Created user: ${u.name} (${u.email})`);
    }
    console.log(`✅ Seeded ${USERS.length} users`);

    // Seed products
    db.products.insertMany(PRODUCTS);
    console.log(`✅ Seeded ${PRODUCTS.length} products`);

    // Seed sample orders
    const drAshraf = db.users.findOne({ uid: 'd1' });
    const drNader = db.users.findOne({ uid: 'd2' });
    const owner = db.users.findOne({ uid: 'owner' });

    const sampleOrders = [
      { orderId:'#DS-44821', userId:drAshraf._id, items:[{productId:1,name:PRODUCTS[0].name,brand:PRODUCTS[0].brand,price:PRODUCTS[0].price,qty:2,img:PRODUCTS[0].img,pts:PRODUCTS[0].pts}], subtotal:2500, shipping:150, total:2650, status:'Delivered', ptsEarned:250, paymentMethod:'COD', trackingId:'TRK-DS44821', estimatedDelivery:'Jan 18 – Jan 20, 2025' },
      { orderId:'#DS-44822', userId:drAshraf._id, items:[{productId:3,name:PRODUCTS[2].name,brand:PRODUCTS[2].brand,price:PRODUCTS[2].price,qty:1,img:PRODUCTS[2].img,pts:PRODUCTS[2].pts}], subtotal:3850, shipping:150, total:4000, status:'Shipped', ptsEarned:385, paymentMethod:'Card', trackingId:'TRK-DS44822', estimatedDelivery:'Feb 2 – Feb 4, 2025' },
      { orderId:'#DS-44823', userId:drNader._id, items:[{productId:7,name:PRODUCTS[6].name,brand:PRODUCTS[6].brand,price:PRODUCTS[6].price,qty:1,img:PRODUCTS[6].img,pts:PRODUCTS[6].pts}], subtotal:14500, shipping:0, total:14500, status:'Delivered', ptsEarned:1450, paymentMethod:'InstaPay', trackingId:'TRK-DS44823', estimatedDelivery:'Jan 25 – Jan 27, 2025' },
      { orderId:'#DS-44824', userId:owner._id, items:[{productId:8,name:PRODUCTS[7].name,brand:PRODUCTS[7].brand,price:PRODUCTS[7].price,qty:1,img:PRODUCTS[7].img,pts:PRODUCTS[7].pts}], subtotal:245000, shipping:0, total:245000, status:'Pending', ptsEarned:24500, paymentMethod:'Wallet', trackingId:'TRK-DS44824', estimatedDelivery:'Feb 10 – Feb 12, 2025' },
      { orderId:'#DS-44825', userId:drNader._id, items:[{productId:10,name:PRODUCTS[9].name,brand:PRODUCTS[9].brand,price:PRODUCTS[9].price,qty:1,img:PRODUCTS[9].img,pts:PRODUCTS[9].pts},{productId:5,name:PRODUCTS[4].name,brand:PRODUCTS[4].brand,price:PRODUCTS[4].price,qty:1,img:PRODUCTS[4].img,pts:PRODUCTS[4].pts}], subtotal:25000, shipping:0, total:25000, status:'Delivered', ptsEarned:2500, paymentMethod:'COD', trackingId:'TRK-DS44825', estimatedDelivery:'Feb 15 – Feb 17, 2025' },
    ];

    sampleOrders.forEach(o => db.orders.insert(o));
    console.log(`✅ Seeded ${sampleOrders.length} sample orders`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('─'.repeat(60));
    USERS.filter(u => u.password).forEach(u => {
      console.log(`  ${u.role.padEnd(10)} | ${u.email.padEnd(30)} | ${u.password}`);
    });
    console.log('─'.repeat(60));
    console.log('  Guest     | No credentials needed — click "Browse as Guest"');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
