import React, { useState } from "react";
import { Modal, Text, TextInput, View } from "react-native";

const NameDocument = () => {
  const [nome, setNome] = useState();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        setShowModal(!showModal);
      }}
    >
      <View>
        <Text>Insira o nome do arquivo</Text>
        <TextInput onChange={(e) => setNome(e)} value={nome} />
      </View>
    </Modal>
  );
};

export default NameDocument;

// Ver se aquele documento sobe pro portal