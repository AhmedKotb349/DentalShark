/**
 * FACTORY METHOD PATTERN
 * -------------------------------------------------------------------------
 * Registration used to build a plain object literal by hand inside the
 * route handler and stuff a `role` string on it. That means every place
 * that needs role-specific defaults (department label, loyalty points
 * eligibility, whether the account can supply products, etc.) has to
 * re-implement an if/else on `role`.
 *
 * Here, `AppUser` is the abstract product, each concrete role
 * (RegularUser / VendorUser / DoctorUser / StaffUser) is a subclass that
 * knows its own defaults, and `UserFactory.createUser(role, data)` is the
 * factory method that decides which class to instantiate. The auth route
 * calls the factory instead of calling `new` on a concrete class directly,
 * so adding a new role later only means adding one subclass + one case in
 * the factory — nothing else in the app has to change.
 */

class AppUser {
  constructor({ name, email, password, phone }) {
    this.uid = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    this.name = name;
    this.email = email.toLowerCase().trim();
    this.password = password; // hashed later by Database.users.insert()
    this.phone = phone || '—';
    this.initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    this.color = AppUser.randomColor();
    this.joined = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    this.orders = 0;
    this.sharkPts = 0;
    this.spent = '—';
    this.role = 'Customer';
    this.dept = 'Dental Professional';
  }

  static randomColor() {
    const colors = [
      'linear-gradient(135deg,#1d4ed8,#3b82f6)',
      'linear-gradient(135deg,#7c3aed,#a855f7)',
      'linear-gradient(135deg,#059669,#10b981)',
      'linear-gradient(135deg,#d97706,#f59e0b)',
      'linear-gradient(135deg,#db2777,#f472b6)',
      'linear-gradient(135deg,#0891b2,#22d3ee)',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  toObject() {
    // strip helper methods, keep only plain data for storage
    const { toObject, ...plain } = this;
    return plain;
  }
}

class RegularUser extends AppUser {
  constructor(data) {
    super(data);
    this.role = 'Doctor';
    this.dept = 'Dental Professional';
  }
}

class DoctorUser extends AppUser {
  constructor(data) {
    super(data);
    this.role = 'Doctor';
    this.dept = 'Dental Professional';
  }
}

class VendorUser extends AppUser {
  constructor(data) {
    super(data);
    this.role = 'Vendor';
    this.dept = 'Supply Partner';
  }
}

class StudentUser extends AppUser {
  constructor(data) {
    super(data);
    this.role = 'Student';
    this.dept = 'Dental Student';
  }
}

class StaffUser extends AppUser {
  constructor(data) {
    super(data);
    this.role = 'Staff';
    this.dept = 'Inventory / Operations';
  }
}

const UserFactory = {
  /** The Factory Method: decides *which* concrete User subclass to build. */
  createUser(role, data) {
    switch ((role || '').toLowerCase()) {
      case 'vendor':  return new VendorUser(data);
      case 'student': return new StudentUser(data);
      case 'staff':
      case 'admin':
      case 'ceo':
      case 'engineer': return new StaffUser(data);
      case 'doctor':
      case 'dentist':  return new DoctorUser(data);
      default:          return new RegularUser(data);
    }
  },
};

module.exports = { UserFactory, AppUser, RegularUser, VendorUser, DoctorUser, StudentUser, StaffUser };
