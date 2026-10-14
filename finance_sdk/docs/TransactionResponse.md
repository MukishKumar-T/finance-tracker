# TransactionResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **int** |  | 
**description** | **str** |  | 
**amount** | **float** | Absolute value of the transaction amount. | 
**transaction_type** | **str** |  | 
**category** | **str** |  | 
**auto_tagged** | **bool** |  | 
**timestamp** | **datetime** |  | 

## Example

```python
from finance_sdk.models.transaction_response import TransactionResponse

# TODO update the JSON string below
json = "{}"
# create an instance of TransactionResponse from a JSON string
transaction_response_instance = TransactionResponse.from_json(json)
# print the JSON string representation of the object
print(TransactionResponse.to_json())

# convert the object into a dict
transaction_response_dict = transaction_response_instance.to_dict()
# create an instance of TransactionResponse from a dict
transaction_response_from_dict = TransactionResponse.from_dict(transaction_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


