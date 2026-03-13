# CMS C4 Diagrams 

## CMS Context Diagram
![CMS Context Diagram](./CMS%20Context%20Diagram.png)

## CMS Container Diagram
![CMS Container Diagram](./CMS%20Container%20Diagram.png)

## CMS Core Component Diagram
![CMS Core Component Diagram](./CMS%20Core%20Component%20Diagram.png)


```bash
cms/
│
├── src/
│   │
│   ├── kernel/            # Microkernel (plugin + event system)
│   │   ├── plugin-manager.js
│   │   ├── event-bus.js
│   │   └── container.js
│   │
│   ├── modules/           # Core business modules
│   │   ├── content/
│   │   │   ├── service.js
│   │   │   ├── controller.js
│   │   │   └── model.js
│   │   │
│   │   └── users/
│   │       ├── service.js
│   │       ├── controller.js
│   │       └── model.js
│   │
│   ├── plugins/           # Extensions
│   │   ├── seo/
│   │   │   └── index.js
│   │   │
│   │   └── search/
│   │       └── index.js
│   │
│   ├── infrastructure/    # Adapter layer
│   │   ├── database.js
│   │   ├── cache.js
│   │   └── storage.js
│   │
│   ├── routes.js
│   └── app.js
│
├── config/
│   └── default.js
│
├── package.json
└── server.js
```