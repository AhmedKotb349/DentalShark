export const USERS=[
  {id:"owner",name:"Eng. Ahmed Kotb",role:"CEO",dept:"CEO & Admin",email:"ahmed.kotb@dentalshark.eg",phone:"+20 100 123 4567",initials:"AK",color:"linear-gradient(135deg,#1d4ed8,#3b82f6)",orders:42,spent:"EGP 280,000",joined:"Jan 2022"},
  {id:"eng",name:"Eng. Mohamed Kotb",role:"Engineer",dept:"Head Engineer & Repairing",email:"m.kotb@dentalshark.eg",phone:"+20 101 234 5678",initials:"MK",color:"linear-gradient(135deg,#7c3aed,#a855f7)",orders:0,spent:"—",joined:"Jan 2022"},
  {id:"v1",name:"Eng. Mohamed Gomaa",role:"Vendor",dept:"Handpieces Supply Partner",email:"m.gomaa@dentalshark.eg",phone:"+20 102 345 6789",initials:"MG",color:"linear-gradient(135deg,#059669,#10b981)",orders:0,spent:"—",joined:"Mar 2022"},
  {id:"v2",name:"Eng. Ahmed Sedky",role:"Vendor",dept:"Sterilization Supply Partner",email:"a.sedky@dentalshark.eg",phone:"+20 103 456 7890",initials:"AS",color:"linear-gradient(135deg,#d97706,#f59e0b)",orders:0,spent:"—",joined:"Jun 2022"},
  {id:"d1",name:"Dr. Ashraf Elsokary",role:"Doctor",dept:"Senior Dental Consultant",email:"dr.ashraf@clinic.eg",phone:"+20 104 567 8901",initials:"AE",color:"linear-gradient(135deg,#db2777,#f472b6)",orders:18,spent:"EGP 45,000",joined:"Feb 2023"},
  {id:"d2",name:"Dr. Nader Mersal",role:"Doctor",dept:"Orthodontist Specialist",email:"dr.nader@clinic.eg",phone:"+20 105 678 9012",initials:"NM",color:"linear-gradient(135deg,#0891b2,#22d3ee)",orders:24,spent:"EGP 62,000",joined:"Apr 2023"},
  {id:"ad1",name:"David Samir",role:"Staff",dept:"Inventory Manager",email:"d.samir@dentalshark.eg",phone:"+20 106 789 0123",initials:"DS",color:"linear-gradient(135deg,#7c3aed,#ec4899)",orders:0,spent:"—",joined:"Mar 2022"},
  {id:"ad2",name:"Omar Essam",role:"Student",dept:"Logistics Intern",email:"o.essam@dentalshark.eg",phone:"+20 107 890 1234",initials:"OE",color:"linear-gradient(135deg,#3b82f6,#2dd4bf)",orders:0,spent:"—",joined:"Apr 2022"},
  {id:"guest",name:"Guest User",role:"Guest",dept:"Visitor",email:"guest@dentalshark.eg",phone:"—",initials:"GU",color:"#64748b",orders:0,spent:"—",joined:"Apr 2026"},
];

export const PRODUCTS = [
  {id:1, name:"Tetric N-Ceram Composite 3.5g", brand:"Ivoclar Vivadent", cat:"RESTORATIVE", cat2:"Restorative", price:1250, old:1490, badge:"sale", rating:4.8, rev:98, pts:125, img:"https://th.bing.com/th/id/OIP.VWEs7OeSvwIwna0uAeFaZwHaGE?w=229&h=196&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Light-cured nano-hybrid composite for anterior and posterior restorations with excellent aesthetics, durability, and natural shade matching."},
  {id:2, name:"Neo Spectra ST LV Composite 3g", brand:"Dentsply Sirona", cat:"RESTORATIVE", cat2:"Restorative", price:1575, old:1850, badge:"hot", rating:4.7, rev:76, pts:157, img:"https://th.bing.com/th/id/OIP.WAttaUiM9h9s5tkP6Kv_gQHaHa?w=195&h=195&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Universal nano-ceramic composite with SphereTEC filler technology for superior handling and polish."},
  {id:3, name:"NSK Pana-Max Plus Turbine", brand:"NSK", cat:"HANDPIECES", cat2:"Handpieces", price:3850, old:4500, badge:"new", rating:4.9, rev:42, pts:385, img:"https://tse2.mm.bing.net/th/id/OIP.xYoV5VBe89iqOxlatXKCSwHaHa?pid=ImgDet&w=202&h=202&c=7&dpr=2&o=7&rm=3", desc:"High-speed air turbine with ceramic bearings and anti-retraction valve for enhanced durability."},
  {id:4, name:"Cavitron 300 Ultrasonic Scaler", brand:"Dentsply Sirona", cat:"PERIODONTICS", cat2:"Periodontics", price:42000, old:48000, badge:"sale", rating:4.9, rev:15, pts:4200, img:"https://th.bing.com/th/id/OIP.9CZykMaBkwfiscyDh0vIhgHaE7?w=281&h=188&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Advanced digital ultrasonic scaling system with Steri-Mate 360 handpiece and wireless pedal."},
  {id:5, name:"Eighteeth E-Connect S Endo Motor", brand:"Eighteeth", cat:"ENDODONTICS", cat2:"Endodontics", price:9800, old:11500, badge:"hot", rating:4.7, rev:28, pts:980, img:"https://th.bing.com/th/id/OIP.SrDfdBbFkdBblqcID22sPAHaHZ?w=171&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Cordless endodontic motor with built-in apex locator and multi-program settings."},
  {id:6, name:"Mocom B Futura Autoclave 22L", brand:"Mocom", cat:"STERILIZATION", cat2:"Sterilization", price:85000, old:92000, badge:"new", rating:4.9, rev:12, pts:8500, img:"https://th.bing.com/th/id/OIP.koNOwKLA50dGIsNu3VJZJwHaFj?w=258&h=194&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Premium Class B steam sterilizer with Wi-Fi connectivity and integrated water sensor."},
  {id:7, name:"Woodpecker i-Sensor H1", brand:"Woodpecker", cat:"IMAGING", cat2:"Imaging", price:14500, old:16000, badge:"sale", rating:4.6, rev:34, pts:1450, img:"https://tse2.mm.bing.net/th/id/OIP.4ia4LH5Y3jr8EXfnz9GMcAHaHa?pid=ImgDet&w=202&h=202&c=7&dpr=2&o=7&rm=3", desc:"High-definition intraoral digital X-ray sensor with ultra-slim design for patient comfort."},
  {id:8, name:"KaVo Primus 1058 Life", brand:"KaVo", cat:"DENTAL UNITS", cat2:"Dental Units", price:245000, old:270000, badge:"hot", rating:4.9, rev:8, pts:24500, img:"https://th.bing.com/th/id/OIP.fsiqwbZYkZdi4davFzUsgQHaEK?w=297&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Ergonomic dental chair with high-quality upholstery and integrated hygiene functions."},
  {id:9, name:"3M Filtek Z350 XT Composite", brand:"3M ESPE", cat:"RESTORATIVE", cat2:"Restorative", price:1450, old:1600, badge:"new", rating:4.9, rev:112, pts:145, img:"https://th.bing.com/th/id/OIP.t85XC-d_3kUAR5zSOCqHLQHaHa?w=201&h=201&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Premium universal nanocomposite with excellent wear resistance and polish retention."},
  {id:10, name:"NSK Ti-Max Z95L Contra-Angle", brand:"NSK", cat:"HANDPIECES", cat2:"Handpieces", price:15200, old:17500, badge:"hot", rating:5.0, rev:45, pts:1520, img:"https://blog.confidental.org/wp-content/uploads/2024/06/NSK-Ti-MAX-Z95L-1024x576.png", desc:"1:5 increasing contra-angle handpiece with titanium body and cellular glass optics."},
  {id:11, name:"Woodpecker Endo Radar Plus", brand:"Woodpecker", cat:"ENDODONTICS", cat2:"Endodontics", price:12500, old:14000, badge:"sale", rating:4.8, rev:64, pts:1250, img:"https://tse2.mm.bing.net/th/id/OIP.QFAHmfoktISJh0kXsUqHEwHaHa?pid=ImgDet&w=202&h=202&c=7&dpr=2&o=7&rm=3", desc:"Wireless endo motor with integrated apex locator, supporting reciprocating and rotary motion."},
  {id:12, name:"KaVo Kerr SonicFill 3", brand:"KaVo Kerr", cat:"RESTORATIVE", cat2:"Restorative", price:8900, old:9500, badge:"new", rating:4.7, rev:39, pts:890, img:"https://th.bing.com/th/id/OIP.sXYU6QHA5R_ACe1S_SgsAwHaGf?w=193&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Advanced sonic-activated bulk fill system for fast and void-free restorations."},
  {id:13, name:"Dentsply Propex Pixi", brand:"Dentsply Sirona", cat:"ENDODONTICS", cat2:"Endodontics", price:7400, old:8200, badge:"hot", rating:4.9, rev:51, pts:740, img:"https://th.bing.com/th/id/OIP.pIsuycSCQNzd6E8JclKQWAHaHa?w=177&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Miniature apex locator that fits in your pocket, accurate in both wet and dry canals."},
  {id:14, name:"W&H Lina Autoclave 22L", brand:"W&H", cat:"STERILIZATION", cat2:"Sterilization", price:92000, old:105000, badge:"sale", rating:5.0, rev:19, pts:9200, img:"https://th.bing.com/th/id/OIP.pOJrW93ZT5Utxvwjo3J31wHaHa?w=193&h=193&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Reliable Class B sterilizer with Eco Dry technology and low water consumption."},
  {id:15, name:"KaVo Mastertorque M9000L", brand:"KaVo", cat:"HANDPIECES", cat2:"Handpieces", price:18500, old:21000, badge:"new", rating:4.9, rev:24, pts:1850, img:"https://th.bing.com/th/id/OIP.yViZBp68qmO77JZ-rwN89AHaHa?w=187&h=187&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"High-end turbine with Direct Stop Technology and silent operation."},
  {id:16, name:"Meta Biomed EQ-V Fill", brand:"Meta Biomed", cat:"ENDODONTICS", cat2:"Endodontics", price:11200, old:13000, badge:"hot", rating:4.8, rev:18, pts:1120, img:"https://th.bing.com/th/id/OIP.TghORw7OYJZZZDzNHEDu0gHaHa?w=162&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Gutta-percha obturation system for precise root canal filling."},
  {id:17, name:"Tokuyama Estelite Sigma Quick", brand:"Tokuyama Dental", cat:"RESTORATIVE", cat2:"Restorative", price:1150, old:1350, badge:"sale", rating:4.9, rev:56, pts:115, img:"https://thfvnext.bing.com/th/id/OIP.T0i8oWjf2ipR1N4mRBsndgHaGq?w=206&h=186&c=7&r=0&o=7&cb=thfvnextfalcon&dpr=2&pid=1.7&rm=3", desc:"Quick-curing universal composite with outstanding polishability."},
  {id:18, name:"NSK Surgic Pro Optic", brand:"NSK", cat:"SURGICAL", cat2:"Surgical", price:72000, old:80000, badge:"new", rating:5.0, rev:11, pts:7200, img:"https://th.bing.com/th/id/OIP.D4HokRF6NcDg0Dfwu8qsbgHaEK?w=324&h=182&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Micromotor system for oral surgery and dental implants with LED optics."},
  {id:19, name:"Promedica N-Fill Flow", brand:"Promedica", cat:"RESTORATIVE", cat2:"Restorative", price:650, old:850, badge:"hot", rating:4.7, rev:41, pts:65, img:"https://tse4.mm.bing.net/th/id/OIP.Pr06ArbSv7y_i_N3e56ksQAAAA?pid=ImgDet&w=202&h=105&c=7&dpr=2&o=7&rm=3", desc:"Light-cured flowable restorative composite for minimal intervention."},
  {id:20, name:"Dentsply Aquasil Soft Putty", brand:"Dentsply Sirona", cat:"RESTORATIVE", cat2:"Restorative", price:1950, old:2200, badge:"sale", rating:4.8, rev:29, pts:195, img:"https://th.bing.com/th/id/OIP.57b1PbtLgOOJwBFVAHYLjwHaE7?w=266&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3", desc:"Premium silicone impression material for highly accurate restorations."},
];

export const CATS=[{n:"Restorative",i:"🔬"},{n:"Endodontics",i:"🔩"},{n:"Handpieces",i:"⚙️"},{n:"Dental Units",i:"🦷"},{n:"Sterilization",i:"🧪"},{n:"Imaging",i:"📡"},{n:"Periodontics",i:"🌿"},{n:"Orthodontics",i:"😁"},{n:"Surgical",i:"🔪"}];

export const BRANDS=["Ivoclar Vivadent","Dentsply Sirona","Tokuyama Dental","Promedica","Schutz Dental","Dentkist","Meta Biomed","Eighteeth Medical"];

export const SERVICES=[
  {ic:"🔧",nm:"Handpiece Repair",pr:"From 800 EGP",ds:"Full turbine overhaul, bearing replacement, spray system. KaVo, NSK, W&H, Bien-Air."},
  {ic:"📡",nm:"X-Ray Calibration",pr:"From 1,200 EGP",ds:"Digital sensor calibration, generator maintenance, image quality optimization."},
  {ic:"🪑",nm:"Chair Service",pr:"From 1,500 EGP",ds:"Hydraulic system, upholstery, instrument tray, light maintenance. All brands."},
  {ic:"♻️",nm:"Autoclave Service",pr:"From 900 EGP",ds:"Seal replacement, pressure testing, cycle validation. Class B compliance."},
  {ic:"🔬",nm:"Full Clinic Audit",pr:"From 2,500 EGP",ds:"Complete examination of all equipment with detailed condition report and recommendations."},
  {ic:"📋",nm:"Annual Contract",pr:"From 3,600 EGP/yr",ds:"Priority 24h response, free minor repairs, quarterly preventive checks included."},
];


export const NOTIFS=[
  {t:"New order — NSK Turbine Handpiece placed",tm:"2 min ago",read:false,audience:"admin"},
  {t:"Repair completed — KaVo Dental Chair serviced",tm:"1 hr ago",read:false,audience:"admin"},
  {t:"Flash deal: 40% off autoclaves — 2 hrs left!",tm:"3 hrs ago",read:false,audience:"public"},
  {t:"Eng. Gomaa listed 3 new handpieces",tm:"Yesterday",read:true,audience:"admin"},
  {t:"Dr. Ashraf placed a new order",tm:"2 days ago",read:true,audience:"admin"},
  {t:"Welcome to DentalShark! 🦈 You earned 100 bonus points",tm:"Jan 2023",read:true,audience:"member"},
];

// Notifications are static demo data (no per-user notification store yet), so
// scope by role instead of by identity: Admin/Staff/CEO see the business-wide
// feed; everyone else sees only public marketing + their own welcome message;
// guests see only public notifications, since they have no account history.
export function getVisibleNotifs(isStaffOrAdmin, isGuest) {
  return NOTIFS.filter(n => {
    if (n.audience === 'admin') return isStaffOrAdmin;
    if (n.audience === 'member') return !isGuest;
    return true; // 'public'
  });
}

export const VALUES=[
  {ic:"🎯",nm:"Quality First",ds:"Every product verified for authenticity. We partner only with certified international dental brands recognized globally for quality and innovation."},
  {ic:"🤖",nm:"AI Innovation",ds:"Egypt's first dental marketplace with integrated AI diagnostics — powered by machine learning trained on 500K+ dental images."},
  {ic:"💛",nm:"Community",ds:"More than a marketplace — a thriving community of 5,000+ Egyptian dental professionals sharing knowledge, trust and expertise."},
];
