import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, View, StyleSheet, Image } from "react-native";

const ModalImage = (children) => {
  console.log("algo aqui");

  const { image, index, setImage, showModal, setShowModal, deleteImage } =
    children;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        setShowModal(!showModal);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Image
            source={{ uri: `file://${image}` }}
            style={{ height: 500, width: 500, margin: 1 }}
          />
          <View style={styles.buttons}>
            <Pressable
              style={[
                styles.button,
                styles.buttonClose,
                { backgroundColor: "red" },
              ]}
              onPress={() => deleteImage()}
            >
              <Text style={styles.textStyle}>Excluir foto</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.buttonClose,
                { backgroundColor: "gray" },
              ]}
              onPress={() => setShowModal(!showModal)}
            >
              <Text style={styles.textStyle}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalImage;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttons: {
    // flex: 1,
    flexDirection: "row",
    // justifyContent: "center",
    width: "100%",
    // borderColor: "red",
    // borderWidth: 1,
    alignItems: "center",
    alignSelf: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    marginTop: 10,
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    margin: 10,
    width: 100,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
