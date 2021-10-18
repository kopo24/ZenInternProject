/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LogLevel } from "@azure/msal-browser";

/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md 
 */
export const msalConfig = {
    auth: {
        clientId: "233e7892-1986-41e9-a8f6-7b524d103403",
        authority: "https://login.microsoftonline.com/785087ba-1e72-4e7d-b1d1-4a9639137a66",
        redirectUri: "http://localhost:3000/"
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {	
        loggerOptions: {	
            loggerCallback: (level, message, containsPii) => {
                // console.log("✔level", level)
                if (containsPii) {		
                    return;		
                }		
                switch (level) {		
                    case LogLevel.Error:		
                        console.error(message);		
                        return;		
                    case LogLevel.Info:		
                        // console.info(message);		
                        return;		
                    case LogLevel.Verbose:		
                        console.debug(message);		
                        return;		
                    case LogLevel.Warning:		
                        console.warn(message);		
                        return;		
                }	
            }	
        }	
    }
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit: 
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest = {
    scopes: ["User.Read"]
};

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
// Request Login using Token
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};

// Request User Information
export const managementRequest = {
    scopes: ["https://management.azure.com/user_impersonation"]
};

// Subscription List
export const subscriptionsConfig = {
    subscriptionsMeEndpoint: "https://management.azure.com/subscriptions?api-version=2020-01-01"
};

// Resource Group List
export const resourceGroupsConfig = {
    resourceGroupsMeEndpointHead: "https://management.azure.com/subscriptions/",
    resourceGroupsMeEndpointTail: "/resourcegroups?api-version=2021-04-01"
};

// Virtual Machine List
export const virtualMachinesConfig = {
    virtualMachinesMeEndpointHead: "https://management.azure.com",
    virtualMachinesMeEndpointTail: "/providers/Microsoft.Compute/virtualMachines?api-version=2021-03-01"
};

export const VmUsageConfig = {
    // Total
    vmUsageMeEndpointHead: "https://management.azure.com",
    
    // CPU
    vmPercentageCPUMeEndpointTail: "/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=Percentage CPU"/*&timespan=PT1H&interval=PT5M*/,
    
    // Network
    vmNetworkInTotalMeEndpointTail: "/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=Network In Total",
    vmNwtworkOutTotalMeEndpointTail: "/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=Network Out Total",
    
    // Disk Read & Write
    vmDiskReadBytesMeEndpointTail: "/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=Disk Read Bytes",
    vmDiskWriteBytesMeEndpointTail: "/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=Disk Write Bytes",
    
    // Disk Operations per Sec
    vmDiskReadOperationsSecMeEndpointTail: "/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=Disk Read Operations/Sec",
    vmDiskWriteOperationsSecMeEndpointTail: "/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=Disk Write Operations/Sec",
    
    // Memory
    vmAvailableMemoryBytesMeEndpointTail: "/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=Available Memory Bytes"
}