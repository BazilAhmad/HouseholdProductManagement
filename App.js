import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, TextInput, TouchableOpacity, Text, View, Alert } from 'react-native';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

function generateUUID() {
  let d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Direct configuration for AWS SDK
AWS.config.update({
  region: 'us-east-2',
  // Note: For production, use Amazon Cognito Identity Pools or AWS Amplify to manage AWS credentials securely.
  credentials: new AWS.Credentials('AKIAZQ3DOWPV7VPJNPOL', 'HdmsvBJZnPSsbVGWFcB3XXyIpNfizUQyXeo4uH5C'),
});

const App = () => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [productID, setProductID] = useState('');

  const [lambda, setLambda] = useState(null);

  useEffect(() => {
    setLambda(new AWS.Lambda());
  }, []);

  const addProduct = async () => {
    if (!lambda) {
      Alert.alert('Error', 'AWS Lambda is not initialized yet.');
      return;
    }

    const payload = {
      productID: generateUUID(), // Generate a new UUID for each product
      productName,
      quantity: parseInt(quantity, 10),
      description,
    };

    const params = {
      FunctionName: 'AddProduct',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(payload),
    };

    try {
      const response = await lambda.invoke(params).promise();
      console.log(response);
      Alert.alert('Success', 'Product added successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add product.');
    }
  };

  const deleteProduct = async () => {
    if (!lambda || !productID) {
      Alert.alert('Error', 'AWS Lambda is not initialized yet or product ID is missing.');
      return;
    }

    const params = {
      FunctionName: 'delete_product',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({ pathParameters: { productID } }),
    };

    try {
      const response = await lambda.invoke(params).promise();
      console.log(response);
      Alert.alert('Success', 'Product deleted successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to delete product.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputGroup}>
        <TextInput style={styles.input} value={productID} onChangeText={setProductID} placeholder="Product ID" />
        <TextInput style={styles.input} value={productName} onChangeText={setProductName} placeholder="Product Name" />
        <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="Quantity" keyboardType="numeric" />
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" />
        <TouchableOpacity style={styles.button} onPress={addProduct}>
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={deleteProduct}>
          <Text style={styles.buttonText}>Delete Product</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default App;
