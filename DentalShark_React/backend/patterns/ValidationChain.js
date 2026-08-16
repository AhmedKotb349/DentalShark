/**
 * CHAIN OF RESPONSIBILITY PATTERN
 * -------------------------------------------------------------------------
 * Registration/login input has to pass several independent checks — empty
 * fields, email format, password strength, and email/role suitability.
 * Instead of one big function with nested if/else branches (which is what
 * the old auth.route.js had), each rule is its own handler object with a
 * single `handle(request)` method. Handlers are linked with `setNext()`;
 * each one either rejects the request (short-circuits with an error) or
 * passes it on to the next link. Adding a new rule later — e.g. a
 * "disposable email domain" check — means writing one new handler class
 * and inserting it into the chain, without touching the others.
 */

class ValidationHandler {
  setNext(handler) {
    this.next = handler;
    return handler; // allows fluent chaining: a.setNext(b).setNext(c)
  }

  handle(request) {
    if (this.next) return this.next.handle(request);
    return { valid: true };
  }
}

class EmptyFieldsHandler extends ValidationHandler {
  handle(request) {
    const { name, email, password, mode } = request;
    const missing = [];
    if (mode === 'register' && !name) missing.push('name');
    if (!email) missing.push('email');
    if (!password && !request.guest) missing.push('password');
    if (missing.length) {
      return { valid: false, error: `Missing required field(s): ${missing.join(', ')}` };
    }
    return super.handle(request);
  }
}

class EmailFormatHandler extends ValidationHandler {
  static RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  handle(request) {
    if (request.guest) return super.handle(request);
    if (!EmailFormatHandler.RE.test(request.email || '')) {
      return { valid: false, error: 'Please enter a valid email address (must contain @)' };
    }
    return super.handle(request);
  }
}

class RoleSuitabilityHandler extends ValidationHandler {
  static check(email, role) {
    const emailLower = (email || '').toLowerCase().trim();
    const roleLower = (role || '').toLowerCase();
    if (roleLower === 'doctor' || roleLower === 'dentist') {
      return emailLower.startsWith('dr.') || emailLower.endsWith('@clinic.eg');
    }
    if (roleLower === 'student') {
      return emailLower.includes('.edu') || emailLower.includes('student') || emailLower.endsWith('@dentalshark.eg');
    }
    if (['admin', 'ceo', 'staff', 'engineer'].includes(roleLower)) {
      return emailLower.endsWith('@dentalshark.eg');
    }
    return true;
  }

  handle(request) {
    if (request.guest || !request.role) return super.handle(request);
    if (!RoleSuitabilityHandler.check(request.email, request.role)) {
      const roleLower = request.role.toLowerCase();
      let msg = 'Admin, Staff, and Engineer emails must end with "@dentalshark.eg"';
      if (roleLower === 'dentist' || roleLower === 'doctor') msg = 'Dentist emails must start with "dr." or end with "@clinic.eg"';
      else if (roleLower === 'student') msg = 'Student emails must contain "student", end with ".edu"/".edu.eg", or end with "@dentalshark.eg"';
      return { valid: false, error: msg };
    }
    return super.handle(request);
  }
}

class PasswordStrengthHandler extends ValidationHandler {
  handle(request) {
    if (request.mode !== 'register') return super.handle(request); // login only needs a match, not strength
    const password = request.password || '';
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('an uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('a lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('a number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('a special character (!@#$%^&*)');
    if (errors.length) {
      return { valid: false, error: 'Password must contain: ' + errors.join(', ') };
    }
    return super.handle(request);
  }
}

/** Builds the concrete chain used by the auth routes. */
function buildAuthValidationChain() {
  const emptyFields = new EmptyFieldsHandler();
  const emailFormat = new EmailFormatHandler();
  const roleSuitability = new RoleSuitabilityHandler();
  const passwordStrength = new PasswordStrengthHandler();

  emptyFields.setNext(emailFormat).setNext(roleSuitability).setNext(passwordStrength);
  return emptyFields; // entry point of the chain
}

module.exports = {
  ValidationHandler,
  EmptyFieldsHandler,
  EmailFormatHandler,
  RoleSuitabilityHandler,
  PasswordStrengthHandler,
  buildAuthValidationChain,
};
