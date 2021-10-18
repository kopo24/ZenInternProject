import React, { useState } from "react";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest, managementRequest, graphConfig, subscriptionsConfig,
         resourceGroupsConfig, virtualMachinesConfig, VmUsageConfig } from "./authConfig";
import { PageLayout } from "./components/PageLayout";
import { callMsToGetToken } from "./getAuthToken";
import "./styles/App.css";
import { Chart, Series, ArgumentAxis, CommonSeriesSettings, CommonAxisSettings, Grid,
         Export, Legend, Margin, Tooltip, Label, Format, ValueAxis, AggregationInterval } from 'devextreme-react/chart';
import moment from "moment";
import CopyToClipboard from "react-copy-to-clipboard";

/**
 * Profile - 프로필
 */
 const ProfileContent = () => {
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState(null);
    // console.log("🤦‍♀️ - 시작 state 값은 null, 값 받으면 다시 확인 -> ", graphData)
    const [getToken, setToken] = useState(null);

    function RequestProfileData() {
        // console.log("🤦‍♂️ - state값 null이면 얻기위해 Request 시작");
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
        }).then((response) => {
            if(getToken === null) {
                setToken(response);
            }
            callMsToGetToken(response.accessToken, graphConfig.graphMeEndpoint).then(response => setGraphData(response));
        });
    }

    const ProfileData = (props) => {
        
        // console.log("🐱‍👤 - Request로 얻은 state값을 props로 받아 사용하여 데이터 출력");
        // console.log("✔ ProfileData props", props);
        // console.log("🎂 getToken", getToken);
        // console.log(moment(getToken.expiresOn).format("YYYY-MM-DD HH:mm:ss"));

        return (
            <div id="profile-div">
                <div id="profile-headline-div">💡<strong>User Information</strong></div>
                <span id="profile-left-span">
                    <strong className="profile-title-strong">Name</strong>
                    <br />
                    <p className="profile-left-p">{props.graphData.displayName}</p>
                    <br />
                    <strong className="profile-title-strong">Audience</strong>
                    <br />
                    <p className="profile-left-p">{getToken.idTokenClaims.aud}</p>
                    <br />
                    <strong className="profile-title-strong">Expiry Date</strong>
                    <br />
                    <p className="profile-left-p">{moment(getToken.expiresOn).format("YYYY-MM-DD HH:mm:ss")}</p>
                </span>
                <span id="profile-right-span">
                    <strong className="profile-title-strong">Email</strong>
                    <br />
                    <p className="profile-right-p">{props.graphData.mail}</p>
                    <br />
                    <strong className="profile-title-strong">Issuer</strong>
                    <br />
                    <p className="profile-right-p">{getToken.idTokenClaims.iss}</p>
                    <br />
                    <strong className="profile-title-strong">Bearer token </strong>
                    <CopyToClipboard text={getToken.accessToken}>
                        <button id="copy-to-clipboard-bearerToken-button">📝</button>
                    </CopyToClipboard>
                    <br />
                    <p className="profile-right-p">{getToken.accessToken}</p>
                </span>
            </div>
        );
    };

    return (
        <>
            {graphData ?
                <ProfileData graphData={graphData} />
                :
                RequestProfileData()
            }
        </>
    );
};

/**
 * Subscriptions - 구독
 */
 const Subscriptions = () => {
    const { instance, accounts } = useMsal();
    const [SubsData, setSubscriptionsData] = useState(null);
    const [subPropsId, setSubPropsId] = useState("");

    function RequestSubscriptions() {
        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, subscriptionsConfig.subscriptionsMeEndpoint).then(response => setSubscriptionsData(response));
        });
    }

    const SubscriptionsData = (props) => {
        
        // console.log("✔ SubsData props", props)

        const Subscriptions = Object.entries(props.SubsData.value).map((value, num) => {
            num = value[1].subscriptionId;
            return (
                    <option key={num} value={num}>
                        {value[1].displayName}
                    </option>
            )
        });

        // console.log("✔ subPropsId", subPropsId);

        return (
            <>
                <select value={subPropsId}
                        onChange={(e) => {
                            const selectSubsId = e.target.value;
                            setSubPropsId(selectSubsId);
                        }}
                >
                    <option value="" disabled>Select Subscription</option>
                    {Subscriptions}
                </select>
                {subPropsId &&
                    <ResourceGroups subPropsId={subPropsId} />
                }
            </>
        );
    };

    return (
        <>
            {SubsData ? 
                <SubscriptionsData SubsData={SubsData} />
                :
                RequestSubscriptions()
            }
        </>
    );
};

/**
 * Resource Groups - 리소스 그룹
 */
 const ResourceGroups = (props) => {
    const { instance, accounts } = useMsal();
    const [rgData, setRgData] = useState(null);
    const [rgPropsId, setRgPropsId] = useState("");

    // console.log("✔ RGs props", props);

    function RequestResourceGroups() {

        const RGendpoint = resourceGroupsConfig.resourceGroupsMeEndpointHead + props.subPropsId + resourceGroupsConfig.resourceGroupsMeEndpointTail;

        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, RGendpoint).then(response => setRgData(response));
        });
    }

    const ResourceGroupsData = (props) => {

        // console.log("✔ RGsData props", props.rgData.value)

        const ResourceGroups = Object.entries(props.rgData.value).map((value, num) => {
            num = value[1].id;
            return (
                <option key={num} value={num}>
                    {value[1].name}
                </option>
            )
        });

        // console.log("✔ rgPropsId", rgPropsId);
    
        return (
            <>
                <select value={rgPropsId}
                        onChange={(e) => {
                            const selectRgName = e.target.value;
                            setRgPropsId(selectRgName);
                        }}
                >
                    <option value="" disabled>Select ResourceGroup</option>
                    {ResourceGroups}
                </select>
                {rgPropsId &&
                    <VirtualMachines rgPropsId={rgPropsId} />
                }
            </>
        );
    };

    return (
        <>
            {rgData ? 
                <ResourceGroupsData rgData={rgData} />
                :
                RequestResourceGroups()
            }
        </>
    );
};

/**
 * Virtual Machines - 가상 머신
 */
 const VirtualMachines = (props) => {
    const { instance, accounts } = useMsal();
    const [vmData, setVmData] = useState(null);
    const [vmPropsId, setVmPropsId] = useState("");
    const [timespan, setTimespan] = useState("");
    const [btnColor, setBtnColor] = useState("btn1");

    // console.log("✔ VMs props", props);

    function RequestVirtualMachines() {
        
        const VMendpoint = virtualMachinesConfig.virtualMachinesMeEndpointHead + props.rgPropsId + virtualMachinesConfig.virtualMachinesMeEndpointTail;

        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, VMendpoint).then(response => setVmData(response));
        });
    }

    const VirtualMachinesData = (props) => {

        // console.log("✔ VmData props", props)

        const VirtualMachines = Object.entries(props.vmData.value).map((value, num) => {
            num = value[1].id;
            return (
                <option key={num} value={value[1].id}>
                    {value[1].name}
                </option>
            )
        });

        // console.log("✔ vmPropsId", vmPropsId);

        return (
            <>
                <select value={vmPropsId}
                        onChange={(e) => {
                            const selectVmName = e.target.value;
                            // console.log(e.target);
                            setVmPropsId(selectVmName);
                        }}
                >
                    <option value="" disabled>Select VirtualMachine</option>
                    {VirtualMachines}
                </select>
                <div id="timespan-div">
                    <button className="timespan-button" style={btnColor === "btn1" ? {background: "skyblue"} : {}} onClick={() => {setTimespan("&timespan=PT1H"), setBtnColor("btn1")}}>1 hour</button>
                    <button className="timespan-button" style={btnColor === "btn2" ? {background: "skyblue"} : {}} onClick={() => {setTimespan("&timespan=PT6H&interval=PT5M"), setBtnColor("btn2")}}>6 hour</button>
                    <button className="timespan-button" style={btnColor === "btn3" ? {background: "skyblue"} : {}} onClick={() => {setTimespan("&timespan=PT12H&interval=PT5M"), setBtnColor("btn3")}}>12 hour</button>
                    <button className="timespan-button" style={btnColor === "btn4" ? {background: "skyblue"} : {}} onClick={() => {setTimespan("&timespan=P1D&interval=PT30M"), setBtnColor("btn4")}}>1 day</button>
                    <button className="timespan-button" style={btnColor === "btn5" ? {background: "skyblue"} : {}} onClick={() => {setTimespan("&timespan=P7D&interval=PT6H"), setBtnColor("btn5")}}>7 day</button>
                    <button className="timespan-button" style={btnColor === "btn6" ? {background: "skyblue"} : {}} onClick={() => {setTimespan("&timespan=P30D&interval=P1D"), setBtnColor("btn6")}}>30 day</button>
                </div>
                <div id="allGraph-div">
                    {vmPropsId &&
                        <VmPercentageCPU vmPropsId={vmPropsId} timespan={timespan} />
                    }
                    {vmPropsId &&
                        <VmNetworkIOTotal vmPropsId={vmPropsId} timespan={timespan} />
                    }
                    {vmPropsId &&
                        <VmDiskRWTotal vmPropsId={vmPropsId} timespan={timespan} />
                    }
                    {vmPropsId &&
                        <VmDiskOperationsRWTotal vmPropsId={vmPropsId} timespan={timespan} />
                    }
                    {vmPropsId &&
                        <VmAvailableMemory vmPropsId={vmPropsId} timespan={timespan} />
                    }
                </div>
            </>
        );
    };

    return (
        <>
            {vmData ?
                <VirtualMachinesData vmData={vmData} />
                :
                RequestVirtualMachines()
            }
        </>
    );
};

/**
 * Percentage CPU Usage of VM - CPU 사용량 - %
 */
 const VmPercentageCPU = (props) => {
    const { instance, accounts } = useMsal();
    const [cpuData, setcpuData] = useState(null);

    // console.log("✔ vmPropsId to CPU", props);

    function RequestVmPercentageCPU() {
        
        const vmPercentageCPUendpoint = VmUsageConfig.vmUsageMeEndpointHead + props.vmPropsId + VmUsageConfig.vmPercentageCPUMeEndpointTail + props.timespan;
        
        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, vmPercentageCPUendpoint).then(response => setcpuData(response));
        });
    }

    const VmPercentageCPUData = (props) => {

        const cpuData = props.cpuData.value[0].timeseries[0].data;

        const result = cpuData.map((item) => {
            // console.log("✔ item", item);
            return {"timeStamp": moment(item.timeStamp).format("DD일 HH:mm"), "average": Number(Number(item.average).toFixed(4))};
        })

        const architectureSources = [
            {value: "average", name: "CPU"}
        ];

        return (
            <React.Fragment>
                <Chart
                    palette="Material"
                    dataSource={result}
                    title="Percentage CPU (%)"
                >
                    <CommonSeriesSettings
                        argumentField="timeStamp"
                        type={"spline"}
                    />
                    <CommonAxisSettings>
                        <Grid visible={false} />
                    </CommonAxisSettings>
                    {
                        architectureSources.map(function(item) {
                            // console.log("✔ item", item)
                            return <Series key={item.value} valueField={item.value} name={item.name} />;
                        })
                    }
                    <Margin bottom={20} />
                    <ArgumentAxis
                        allowDecimals={false}
                        axisDivisionFactor={60}
                    >
                        <Label>
                        <Format type="decimal" />
                        </Label>
                    </ArgumentAxis>
                    <Legend
                        verticalAlignment="top"
                        horizontalAlignment="right"
                    />
                    <Export enabled={true} />
                    <Tooltip enabled={true} />
                </Chart>
            </React.Fragment>
        );
    };

    return (
        <>
            {cpuData ?
                <VmPercentageCPUData cpuData={cpuData} />
                :
                RequestVmPercentageCPU()
            }
        </>
    );
};

/**
 * Network In/Out Total of VM - 네트워크 IN/OUT 전송량 - MB
 */
 const VmNetworkIOTotal = (props) => {
    const { instance, accounts } = useMsal();
    const [nwiData, setnwiData] = useState(null);
    const [nwoData, setnwoData] = useState(null);

    // console.log("✔ vmPropsId to Network", props);

    function RequestVmNetworkIOTotal() {
        
        const vmNetworkInTotalendpoint = VmUsageConfig.vmUsageMeEndpointHead + props.vmPropsId + VmUsageConfig.vmNetworkInTotalMeEndpointTail + props.timespan;
        const vmnetworkOutTotalendpoint = VmUsageConfig.vmUsageMeEndpointHead + props.vmPropsId + VmUsageConfig.vmNwtworkOutTotalMeEndpointTail + props.timespan;

        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, vmNetworkInTotalendpoint).then(response => setnwiData(response));
        });

        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, vmnetworkOutTotalendpoint).then(response => setnwoData(response));
        });
    }

    const VmNetworkIOTotalData = (props) => {

        const nwi = props.nwiData.value[0].timeseries[0].data;
        const nwo = props.nwoData.value[0].timeseries[0].data;
        
        // console.log("✔ nwiData props", nwi)
        // console.log("❤ nwoData props", nwo)

        const result = nwi.map((item, index) => {
            // console.log("item", item)
            return {
                "timeStamp":  moment(item.timeStamp).format("DD일 HH:mm"),
                "in": Number((Number(item.total) / 1000).toFixed(2)),
                "out": Number((Number(nwo[index].total) / 1000).toFixed(2))
            };
        })

        const architectureSources = [
            {value: "in", name: "IN"},
            {value: "out", name: "OUT"}
        ];
        
        return (
            <React.Fragment>
                <Chart
                    palette="Material"
                    dataSource={result}
                    title="Network In/Out Total (KB)"
                >
                    <CommonSeriesSettings
                        argumentField="timeStamp"
                        type={"spline"}
                    />
                    <CommonAxisSettings>
                        <Grid visible={false} />
                    </CommonAxisSettings>
                    {
                        architectureSources.map(function(item) {
                            // console.log("✔ item", item)
                            return <Series key={item.value} valueField={item.value} name={item.name} />;
                        })
                    }
                    <Margin bottom={20} />
                    <ArgumentAxis
                        allowDecimals={false}
                        axisDivisionFactor={60}
                    >
                        <Label>
                        <Format type="decimal" />
                        </Label>
                    </ArgumentAxis>
                    <Legend
                        verticalAlignment="top"
                        horizontalAlignment="right"
                    />
                    <Export enabled={true} />
                    <Tooltip enabled={true} />
                </Chart>
            </React.Fragment>
        );
    };

    return (
        <>
            {nwiData ?
                nwoData ?
                    <VmNetworkIOTotalData
                        nwiData={nwiData}
                        nwoData={nwoData}
                    />
                    :
                    RequestVmNetworkIOTotal()
                :
                RequestVmNetworkIOTotal()
            }
        </>
    );
};

/**
 * Disk Read/Write Total of VM - 디스크 읽기/쓰기 합 - Byte
 */
 const VmDiskRWTotal = (props) => {
    const { instance, accounts } = useMsal();
    const [diskReadData, setDiskReadData] = useState(null);
    const [diskWriteData, setdiskWriteData] = useState(null);

    // console.log("✔ vmPropsId to Disk", props);

    function RequestVmDiskRWTotal() {
        
        const vmDiskReadEndpoint = VmUsageConfig.vmUsageMeEndpointHead + props.vmPropsId + VmUsageConfig.vmDiskReadBytesMeEndpointTail + props.timespan;
        const vmDiskWriteEndpoint = VmUsageConfig.vmUsageMeEndpointHead + props.vmPropsId + VmUsageConfig.vmDiskWriteBytesMeEndpointTail + props.timespan;

        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, vmDiskReadEndpoint).then(response => setDiskReadData(response));
        });

        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, vmDiskWriteEndpoint).then(response => setdiskWriteData(response));
        });
    }

    const VmDiskRWTotalData = (props) => {
        
        const diskReadData = props.diskReadData.value[0].timeseries[0].data;
        const diskWriteData = props.diskWriteData.value[0].timeseries[0].data;
        
        // console.log("✔ diskReadData props", diskReadData)
        // console.log("❤ diskWriteData props", diskWriteData)

        const result = diskReadData.map((item, index) => {
            return {
                "timeStamp":  moment(item.timeStamp).format("DD일 HH:mm"),
                "read": Number((Number(item.total) / 1000000).toFixed(2)),
                "write": Number((Number(diskWriteData[index].total) / 1000000).toFixed(2))
            };
        })

        const architectureSources = [
            {value: "read", name: "Read"},
            {value: "write", name: "Write"}
        ];
        
        return (
            <React.Fragment>
                <Chart
                    palette="Material"
                    dataSource={result}
                    title="Disk Read/Write Total (MB)"
                >
                    <CommonSeriesSettings
                        argumentField="timeStamp"
                        type={"spline"}
                    />
                    <CommonAxisSettings>
                        <Grid visible={false} />
                    </CommonAxisSettings>
                    {
                        architectureSources.map(function(item) {
                            // console.log("✔ item", item)
                            return <Series key={item.value} valueField={item.value} name={item.name} />;
                        })
                    }
                    <Margin bottom={20} />
                    <ArgumentAxis
                        allowDecimals={false}
                        axisDivisionFactor={60}
                    >
                        <Label>
                        <Format type="decimal" />
                        </Label>
                    </ArgumentAxis>
                    <Legend
                        verticalAlignment="top"
                        horizontalAlignment="right"
                    />
                    <Export enabled={true} />
                    <Tooltip enabled={true} />
                </Chart>
            </React.Fragment>
        );
    };

    return (
        <>
            {diskReadData ?
                diskWriteData ?
                    <VmDiskRWTotalData
                        diskReadData={diskReadData}
                        diskWriteData={diskWriteData}
                    />
                    :
                    RequestVmDiskRWTotal()
                :
                RequestVmDiskRWTotal()
            }
        </>
    );
};

/**
 * Disk Operations Read/Write Total of VM - 디스크 읽기/쓰기 시간 - Sec
 */
 const VmDiskOperationsRWTotal = (props) => {
    const { instance, accounts } = useMsal();
    const [diskOperReadData, setDiskOperReadData] = useState(null);
    const [diskOperWriteData, setdiskOperWriteData] = useState(null);

    // console.log("✔ vmPropsId to DiskOperations", props);

    function RequestVmDiskOperRWTotal() {
        
        const vmDiskOperReadEndpoint = VmUsageConfig.vmUsageMeEndpointHead + props.vmPropsId + VmUsageConfig.vmDiskReadOperationsSecMeEndpointTail + props.timespan;
        const vmDiskOperWriteEndpoint = VmUsageConfig.vmUsageMeEndpointHead + props.vmPropsId + VmUsageConfig.vmDiskWriteOperationsSecMeEndpointTail + props.timespan;

        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, vmDiskOperReadEndpoint).then(response => setDiskOperReadData(response));
        });

        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, vmDiskOperWriteEndpoint).then(response => setdiskOperWriteData(response));
        });
    }

    const VmDiskOperRWTotalData = (props) => {
        
        const diskReadOperData = props.diskOperReadData.value[0].timeseries[0].data;
        const diskWriteOperData = props.diskOperWriteData.value[0].timeseries[0].data;
        
        // console.log("✔ diskReadOperData props", diskReadOperData)
        // console.log("❤ diskWriteOperData props", diskWriteOperData)

        const result = diskReadOperData.map((item, index) => {
            return {
                "timeStamp":  moment(item.timeStamp).format("DD일 HH:mm"),
                "read": Number(Number(item.average).toFixed(2)),
                "write": Number(Number(diskWriteOperData[index].average).toFixed(2))
            };
        })

        const architectureSources = [
            {value: "read", name: "Read"},
            {value: "write", name: "Write"}
        ];
        
        return (
            <React.Fragment>
                <Chart
                    palette="Material"
                    dataSource={result}
                    title="Disk Operations Read/Write Total (Sec)"
                >
                    <CommonSeriesSettings
                        argumentField="timeStamp"
                        type={"spline"}
                    />
                    <CommonAxisSettings>
                        <Grid visible={false} />
                    </CommonAxisSettings>
                    {
                        architectureSources.map(function(item) {
                            // console.log("✔ item", item)
                            return <Series key={item.value} valueField={item.value} name={item.name} />;
                        })
                    }
                    <Margin bottom={20} />
                    <ArgumentAxis
                        allowDecimals={false}
                        axisDivisionFactor={60}
                    >
                        <Label>
                        <Format type="decimal" />
                        </Label>
                    </ArgumentAxis>
                    <Legend
                        verticalAlignment="top"
                        horizontalAlignment="right"
                    />
                    <Export enabled={true} />
                    <Tooltip enabled={true} />
                </Chart>
            </React.Fragment>
        );
    };

    return (
        <>
            {diskOperReadData ?
                diskOperWriteData ?
                    <VmDiskOperRWTotalData
                        diskOperReadData={diskOperReadData}
                        diskOperWriteData={diskOperWriteData}
                    />
                    :
                    RequestVmDiskOperRWTotal()
                :
                RequestVmDiskOperRWTotal()
            }
        </>
    );
};

/**
 * Available Memory Bytes of VM - 사용 가능한 메모리 - GB
 */
 const VmAvailableMemory = (props) => {
    const { instance, accounts } = useMsal();
    const [memoryData, setMemoryData] = useState(null);

    // console.log("✔ vmPropsId to Memory", props);

    function RequestVmAvailableMemory() {
        
        const vmAvailableMemoryEndpoint = VmUsageConfig.vmUsageMeEndpointHead + props.vmPropsId + VmUsageConfig.vmAvailableMemoryBytesMeEndpointTail + props.timespan;

        instance.acquireTokenSilent({
            ...managementRequest,
            account: accounts[0]
        }).then((response) => {
            callMsToGetToken(response.accessToken, vmAvailableMemoryEndpoint).then(response => setMemoryData(response));
        });
    }

    const VmAvailableMemoryData = (props) => {

        const memoryData = props.memoryData.value[0].timeseries[0].data;
        // console.log("✔ memoryData★☆", memoryData);

        const result = memoryData.map((item) => {
            return {"timeStamp":  moment(item.timeStamp).format("DD일 HH:mm"), "average": Number((Number(item.average) / 1000000000).toFixed(2))};
        })

        const architectureSources = [
            {value: "average", name: "Memory"}
        ];

        return (
            <React.Fragment>
                <Chart
                    palette="Material"
                    dataSource={result}
                    title="Available Memory (GB)"
                >
                    <ValueAxis showZero={true} />
                    <CommonSeriesSettings
                        argumentField="timeStamp"
                        type={"spline"}
                    />
                    <CommonAxisSettings>
                        <Grid visible={false} />
                    </CommonAxisSettings>
                    {
                        architectureSources.map(function(item) {
                            // console.log("✔ item", item)
                            return <Series key={item.value} valueField={item.value} name={item.name} />;
                        })
                    }
                    <Margin bottom={20} />
                    <ArgumentAxis
                        allowDecimals={false}
                        axisDivisionFactor={60}
                    >
                        <Label>
                        <Format type="decimal" />
                        </Label>
                    </ArgumentAxis>
                    <Legend
                        verticalAlignment="top"
                        horizontalAlignment="right"
                    />w
                    <Export enabled={true} />
                    <Tooltip enabled={true} />
                </Chart>
            </React.Fragment>
        );
    };

    return (
        <>
            {memoryData ?
                <VmAvailableMemoryData memoryData={memoryData} />
                :
                RequestVmAvailableMemory()
            }
        </>
    );
};

/**
 * If a user is authenticated the ProfileContent component above is rendered. Otherwise a message indicating a user is not authenticated is rendered.
 */
const MainContent = () => {    
    return (
        <div className="App">
            <AuthenticatedTemplate>
                <ProfileContent />
                <Subscriptions />
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <h5 className="card-title">Please sign-in to see your profile information.</h5>
            </UnauthenticatedTemplate>
        </div>
    );
};

export default function App() {
    return (
        <PageLayout>
            <MainContent />
        </PageLayout>
    );
}
