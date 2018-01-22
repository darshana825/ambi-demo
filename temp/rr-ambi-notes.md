## Technical Concerns/Recommendations

### Security
- assure crypto key login only
- install `fail2ban`
- check and harden server firewall ruleset
- implement local vpn to access data stores
- update to current LTS version of node (__*!important*__)

### Reliability
- implement process management using pm2
- implement testing
- implement CI/CD via jenkins
- pare down unused libs or refactor not to need so many
- use already required libs (moment, lodash) rather than rebuilding the wheel
- share responsibilities across multiple server instances

### Analytics
  - implement logging to ELK
  - add both service and client operational logging

### Scaling
  - virtualize services

### Monitoring
  - implement service monitoring
  - integrate with Slack & PagerDuty

### App Client Concerns
  - First load > __13s__, Page reload > __6s__
  - `io` appears to want `proglobe_notify.local`
  - websocket using polling?
  - adapter.js hitting cdn.temasys.com.sg (singapore)

### UI/UX Issues
  - add visual indication ("saved.") when doc is saved in realtime
  - add rollover tooltips on all controls
  - treat all popovers equally click __x__ or press __esc__ to close)
  - app is not responsive

### Architectural Issues
  - monolithic service, single runtime
    - move to microservices

### Development Issues

- #### Service & Client
  - no linting
  - no build process
  - no architecture plan
  - clean up source to trap errors

- #### App/Service
  - remove reliance on GLOBALS
  - assure modules
  - reorganize src tree
    - move non-middleware into /lib
    - remove *assumed visibility* (i.e. use module system)

- #### App/Client
  - calls google maps without credentials
  - reorganize src tree
    - no unprotected src in /public
  - move styles into components
