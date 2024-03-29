// Adapted from http://en.wikibooks.org/wiki/JavaScript/Best_Practices
// 'cause its proper RFC2822 validation. -james

exports.validate = function(str) {
  // These comments use the following terms from RFC2822:
  // local-part, domain, domain-literal and dot-atom.
  // Does the address contain a local-part followed an @ followed by a domain?
  // Note the use of lastIndexOf to find the last @ in the address
  // since a valid email address may have a quoted @ in the local-part.
  // Does the domain name have at least two parts, i.e. at least one dot,
  // after the @? If not, is it a domain-literal?
  // This will accept some invalid email addresses
  // BUT it doesn't reject valid ones. 
  var atSym = str.lastIndexOf("@");
  if (atSym < 1) { return false; } // no local-part
  if (atSym == str.length - 1) { return false; } // no domain
  if (atSym > 64) { return false; } // there may only be 64 octets in the local-part
  if (str.length - atSym > 255) { return false; } // there may only be 255 octets in the domain

  // Is the domain plausible?
  var lastDot = str.lastIndexOf(".");
  // Check if it is a dot-atom such as example.com
  if (lastDot > atSym + 1 && lastDot < str.length - 1) { return true; }
  //  Check if could be a domain-literal.
  if (str.charAt(atSym + 1) == '[' &&  str.charAt(str.length - 1) == ']') { return true; }
  return false;
}