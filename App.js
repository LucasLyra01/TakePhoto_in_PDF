import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import RNFS, { stat } from "react-native-fs";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
} from "react-native";
import {
  Camera,
  useCameraPermission,
  useCameraDevice,
} from "react-native-vision-camera";
import ModalImage from "./src/components/Modal";
import { PDFDocument } from "pdf-lib";
import Pdf from "react-native-pdf";
import { decode as atob, encode as btoa } from "base-64";

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [photos, setPhotos] = useState([]);
  const [showButtonTakePhoto, setShowButtonTakePhoto] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [pdfBase64, setPdfBase64] = useState({ uri: null, cache: true });
  const [image, setImage] = useState({ image: null, index: null });
  const camera = useRef(null);
  const device = useCameraDevice("back");

  const [showModal, setShowModal] = useState(false);
  const [orientation, setOrientation] = useState("LANDSCAPE");

  useEffect(() => {
    if (!hasPermission) requestPermission();

    determineAndSetOrientation();
    Dimensions.addEventListener("change", determineAndSetOrientation);

    // return () => {
    //   Dimensions.removeEventListener("change", determineAndSetOrientation);
    // };
  }, []);

  const determineAndSetOrientation = () => {
    let width = Dimensions.get("window").width;
    let height = Dimensions.get("window").height;

    if (width < height) setOrientation("PORTRAIT");
    else setOrientation("LANDSCAPE");
  };

  const takePhoto = async () => {
    setShowButtonTakePhoto(true);
    try {
      const file = await camera.current.takePhoto({
        qualityPrioritization: "speed",
        flash: "off",
        enableShutterSound: false,
      });

      await CameraRoll.save(`file://${file.path}`, {
        type: "photo",
      });

      setPhotos((prevPhotos) => [...prevPhotos, file.path]);
      setShowButtonTakePhoto(false);
    } catch (error) {
      console.log(error);
    }
  };

  const openModal = (item, index) => {
    setShowModal(true);
    setImage({ image: item, index: index });
  };

  const deleteImage = () => {
    photos.splice(image.index, 1);
    setShowModal(false);
  };

  const generatePdf = async () => {
    setPdfBase64({ uri: null, cache: true });

    try {
      const pdfDoc = await PDFDocument.create();

      for (const photo of photos) {
        const imageBytes = await RNFS.readFile(photo, "base64");
        const image = await pdfDoc.embedJpg(imageBytes);

        const page = pdfDoc.addPage([image.width, image.height]);
        const { width, height } = page.getSize();

        page.drawImage(image, {
          x: 0,
          y: 0,
          // width,
          // height,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });

      if (pdfBytes.length > 0) console.log("deu certo");
      else console.log("não deu certo");

      await saveFile(pdfBytes);
    } catch (error) {
      console.log(error);
    }
  };

  const saveFile = async (pdfBase64) => {
    const localPath = `${RNFS.DownloadDirectoryPath}/4.pdf`;

    await RNFS.writeFile(
      localPath,
      pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
      "base64"
    )
      .then((response) => console.log("salvo"))
      .catch((err) => console.error(err));
    // write the file

    console.log("PDF salvo com sucesso:", localPath);

    setShowPdf(true);
    setPdfBase64({
      uri: pdfBase64,
      cache: true,
    });
    // readFile();
  };

  // Quando for capturar o arquivo, posso ler da seguinte forma:
  const readFile = () => {
    console.log(" vai ler o arquivo");
    RNFS.readFile("/storage/emulated/0/Download/1.pdf", "base64")
      .then((content) => {
        console.log("leu o arquivo", content);
      })
      .catch((error) => console.error(error));
  };

  return showCamera ? (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View>
        <Camera
          ref={camera}
          photo={true}
          device={device}
          isActive={showCamera}
          style={styles.camera}
        />

        {!showButtonTakePhoto && (
          <View style={styles.viewBtn}>
            <TouchableOpacity
              onPress={() => setShowCamera(false)}
              style={[styles.buttons, { backgroundColor: "green" }]}
            >
              <Text style={[styles.btnText, { color: "white" }]}>
                Finalizar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePhoto}
              style={[
                styles.buttons,
                { marginLeft: 10, backgroundColor: "white" },
              ]}
            >
              <Text style={[styles.btnText, { color: "black" }]}>
                Tirar foto
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  ) : (
    <>
      {!showPdf ? (
        <View style={styles.images}>
          <FlatList
            style={{ alignSelf: "center", margin: 10 }}
            data={photos}
            keyExtractor={(item, index) => index.toString()}
            horizontal={false} // Não mais horizontal
            numColumns={orientation === "PORTRAIT" ? 3 : 5} // Número de colunas desejado
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => openModal(item, index)}>
                <Image
                  source={{ uri: `file://${item}` }}
                  style={{ height: 200, width: 200, margin: 2 }}
                />
              </TouchableOpacity>
            )}
          />
          <View style={styles.buttonsSec2}>
            <TouchableOpacity
              onPress={() => setShowCamera(true)}
              style={[styles.buttonsImages, { backgroundColor: "gray" }]}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonsImages, { backgroundColor: "green" }]}
              onPress={() => generatePdf()}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Gerar PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonsImages, { backgroundColor: "green" }]}
              onPress={() => saveFile()}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Save file</Text>
            </TouchableOpacity>
          </View>

          {showModal && (
            <ModalImage
              image={image.image}
              index={image.index}
              setImage={setImage}
              showModal={showModal}
              setShowModal={setShowModal}
              deleteImage={deleteImage}
            />
          )}
        </View>
      ) : (
        <View style={styles.containerPdf}>
          <>
            <Pdf trustAllCerts={true} source={pdfBase64} style={styles.pdf} />
            <TouchableOpacity onPress={() => setShowPdf(!showPdf)}>
              <Text>Fechar</Text>
            </TouchableOpacity>
          </>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  images: {
    flex: 1,
  },
  camera: {
    height: 460,
    width: "100%",
    height: "100%",
  },
  viewBtn: {
    // borderWidth: 2,
    // borderColor: 'red',
    width: "100%",
    position: "absolute",
    bottom: 5,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    // right: 10,
    flexDirection: "row",

    borderRadius: 8,
    // backgroundColor: "blue",
  },
  buttons: {
    borderRadius: 8,
  },
  btnText: {
    fontSize: 20,
    textAlign: "center",

    margin: 5,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  buttonsSec2: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
  },
  buttonsImages: {
    margin: 5,
    padding: 15,
    paddingVertical: 10,
    borderRadius: 4,
  },
  containerPdf: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
