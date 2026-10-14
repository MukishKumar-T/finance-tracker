# finance_sdk.TransactionsApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_transaction**](TransactionsApi.md#create_transaction) | **POST** /transactions/ | Create a new transaction
[**delete_transaction**](TransactionsApi.md#delete_transaction) | **DELETE** /transactions/{transaction_id} | Delete a transaction
[**get_monthly_summary**](TransactionsApi.md#get_monthly_summary) | **GET** /transactions/summary | Get monthly summary grouped by category
[**list_transactions**](TransactionsApi.md#list_transactions) | **GET** /transactions/ | List transactions with optional filters
[**reclassify_transaction**](TransactionsApi.md#reclassify_transaction) | **PATCH** /transactions/{transaction_id}/reclassify | Manually reclassify a transaction&#39;s category


# **create_transaction**
> TransactionResponse create_transaction(transaction_create)

Create a new transaction

### Example


```python
import finance_sdk
from finance_sdk.models.transaction_create import TransactionCreate
from finance_sdk.models.transaction_response import TransactionResponse
from finance_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = finance_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with finance_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = finance_sdk.TransactionsApi(api_client)
    transaction_create = finance_sdk.TransactionCreate() # TransactionCreate | 

    try:
        # Create a new transaction
        api_response = api_instance.create_transaction(transaction_create)
        print("The response of TransactionsApi->create_transaction:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TransactionsApi->create_transaction: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_create** | [**TransactionCreate**](TransactionCreate.md)|  | 

### Return type

[**TransactionResponse**](TransactionResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Successful Response |  -  |
**409** | Duplicate transaction |  -  |
**422** | Validation error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_transaction**
> delete_transaction(transaction_id)

Delete a transaction

### Example


```python
import finance_sdk
from finance_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = finance_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with finance_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = finance_sdk.TransactionsApi(api_client)
    transaction_id = 56 # int | 

    try:
        # Delete a transaction
        api_instance.delete_transaction(transaction_id)
    except Exception as e:
        print("Exception when calling TransactionsApi->delete_transaction: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **int**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**204** | Successful Response |  -  |
**404** | Transaction not found |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_monthly_summary**
> List[SummaryResponse] get_monthly_summary(month=month)

Get monthly summary grouped by category

### Example


```python
import finance_sdk
from finance_sdk.models.summary_response import SummaryResponse
from finance_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = finance_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with finance_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = finance_sdk.TransactionsApi(api_client)
    month = 'month_example' # str | Filter to a specific month (YYYY-MM) (optional)

    try:
        # Get monthly summary grouped by category
        api_response = api_instance.get_monthly_summary(month=month)
        print("The response of TransactionsApi->get_monthly_summary:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TransactionsApi->get_monthly_summary: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **month** | **str**| Filter to a specific month (YYYY-MM) | [optional] 

### Return type

[**List[SummaryResponse]**](SummaryResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**422** | Invalid month format |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **list_transactions**
> List[TransactionResponse] list_transactions(month=month, type=type, category=category, skip=skip, limit=limit)

List transactions with optional filters

### Example


```python
import finance_sdk
from finance_sdk.models.transaction_response import TransactionResponse
from finance_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = finance_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with finance_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = finance_sdk.TransactionsApi(api_client)
    month = 'month_example' # str | Filter by month (YYYY-MM) (optional)
    type = 'type_example' # str | Filter by type: income or expense (optional)
    category = 'category_example' # str | Filter by category (optional)
    skip = 0 # int |  (optional) (default to 0)
    limit = 100 # int |  (optional) (default to 100)

    try:
        # List transactions with optional filters
        api_response = api_instance.list_transactions(month=month, type=type, category=category, skip=skip, limit=limit)
        print("The response of TransactionsApi->list_transactions:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TransactionsApi->list_transactions: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **month** | **str**| Filter by month (YYYY-MM) | [optional] 
 **type** | **str**| Filter by type: income or expense | [optional] 
 **category** | **str**| Filter by category | [optional] 
 **skip** | **int**|  | [optional] [default to 0]
 **limit** | **int**|  | [optional] [default to 100]

### Return type

[**List[TransactionResponse]**](TransactionResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**422** | Invalid filter value |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **reclassify_transaction**
> TransactionResponse reclassify_transaction(transaction_id, reclassify_request)

Manually reclassify a transaction's category

### Example


```python
import finance_sdk
from finance_sdk.models.reclassify_request import ReclassifyRequest
from finance_sdk.models.transaction_response import TransactionResponse
from finance_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = finance_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with finance_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = finance_sdk.TransactionsApi(api_client)
    transaction_id = 56 # int | 
    reclassify_request = finance_sdk.ReclassifyRequest() # ReclassifyRequest | 

    try:
        # Manually reclassify a transaction's category
        api_response = api_instance.reclassify_transaction(transaction_id, reclassify_request)
        print("The response of TransactionsApi->reclassify_transaction:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TransactionsApi->reclassify_transaction: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **transaction_id** | **int**|  | 
 **reclassify_request** | [**ReclassifyRequest**](ReclassifyRequest.md)|  | 

### Return type

[**TransactionResponse**](TransactionResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**404** | Transaction not found |  -  |
**422** | Validation error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

