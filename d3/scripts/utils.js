export {getIPBucket};

const ipRanges = [
    {start: '172.23.0.10', end: '172.23.0.10', machine: 'DNS'},
    {start: '10.99.99.2', end: '10.99.99.2', machine: 'IDS'},
    {start: '10.32.0.100', end: '10.32.0.100', machine: 'Firewall'},
    {start: '172.25.0.1', end: '172.25.0.1', machine: 'Firewall'},
    {start: '172.23.0.1', end: '172.23.0.1', machine: 'Firewall'},
    {start: '10.32.0.1', end: '10.32.0.1', machine: 'Firewall'},
    {start: '10.32.1.201', end: '10.32.1.206', machine: 'Websites'},
    {start: '10.32.5.1', end: '10.32.5.254', machine: 'Websites'},
    {start: '10.32.1.100', end: '10.32.1.100', machine: 'Websites'},
    {start: '10.32.0.201', end: '10.32.0.210', machine: 'Websites'},
    {start: '172.23.0.2', end: '172.23.0.2', machine: 'Log Server'},
    {start: '172.23.0.3', end: '172.23.0.9', machine: 'Workstation'},
    {start: '172.23.0.11', end: '172.23.50.255', machine: 'Workstation'},
    {start: '172.23.51.0', end: '172.23.100.255', machine: 'Workstation'},
    {start: '172.23.101.0', end: '172.23.150.255', machine: 'Workstation'},
    {start: '172.23.151.0', end: '172.23.200.255', machine: 'Workstation'},
    {start: '172.23.201.0', end: '172.23.213.255', machine: 'Workstation'},
    {start: '172.23.230.0', end: '172.23.255.255', machine: 'Workstation'},
    {start: '172.23.214.0', end: '172.23.229.255', machine: 'Financial Server'}
];

function getIPBucket(ipAddr) {
    let idx = 0;
    for(const ipDict of ipRanges) {
        if(compareIP(ipAddr, ipDict.start, ipDict.end)) {
            return ipRanges[idx];
        }
        idx++;
    }
    return -1;
}

function compareIP(ipO, ipS, ipE) {
    ipO = ipO.split(".");
    ipS = ipS.split(".");
    ipE = ipE.split(".");
    let i = 0;
    while(i < 4) {
        let x = parseInt(ipO[i]), y = parseInt(ipS[i]), z = parseInt(ipE[i])
        i++;
        if(x === y && x === z)
            continue;
        else if(x >= y && x <= z)
            continue;
        else
            return false;
    }

    return true;
}