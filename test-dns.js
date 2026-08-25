const dns = require('dns');

const host = 'ac-tfynlf2-shard-00-00.g9ed34s.mongodb.net';

dns.resolve(host, 'A', (err, addresses) => {
  console.log('IPv4 (A records):', err ? err.message : addresses);
});

dns.resolve(host, 'AAAA', (err, addresses) => {
  console.log('IPv6 (AAAA records):', err ? err.message : addresses);
});

dns.lookup(host, { all: true }, (err, addresses) => {
  console.log('dns.lookup (default):', err ? err.message : addresses);
});
