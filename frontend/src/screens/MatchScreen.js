import React, { useEffect, useContext, useState  } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  Image,
} from 'react-native';
import { Dimensions } from 'react-native';
import UserContext from '../Context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

const screenHeight = Dimensions.get('window').height;
const { width } = Dimensions.get('window');
const height = width * 0.6;

function MatchScreen() {
  const [data, setData] = useState([]);
  const context = useContext(UserContext);
  const user_id = context.user_data.user_id;
  const setTracker = context.setTracker;
  const tracker = context.stateTracker;

  const [active, setActive] = useState([0]);

  const getMatches = async () => {
    try {
      const response = await fetch('http://localhost:3000/match/' + user_id);
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getMatches();
  }, [tracker]);

  const change = ({ nativeEvent }) => {
    const slide = Math.ceil(
      nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width
    );
    if (slide !== active) {
      setActive(slide);
    }
  };

  return (
    <View style={{ height: screenHeight }}>
      <ScrollView>
        {/* <Image style={styles.tinyLogo} source={require('../pics/Snome.png')} /> */}
        <Text style={styles.title}>Snome's you LOVE</Text>
        {data ? (
          data.map((item, index) => (
            <Card style={styles.container} key={index}>
              <TouchableOpacity
                onPress={() => {
                  setTracker(item.snome_id);
                  navigation.navigate('Description', {
                    snome_id: item.snome_id,
                  });
                }}
              >
                <Card.Title
                  numberOfLines={3}
                  title={item.header}
                  subtitle={`Bedrooms: ${item.bedrooms}  Bathrooms: ${item.bathrooms}`}
                />

                <Title
                  style={styles.header}
                  subtitle={`Availability: ${item.availability_start} - ${item.availability_end}`}
                />
              </TouchableOpacity>
              <Card.Content>
                <View style={styles.imageContainer}>
                  <ScrollView
                    pagingEnabled
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onScroll={change}
                    scrollEventThrottle={150}
                    style={styles.scroll}
                  >
                    {item.url.map((url, index) => (
                      <Image
                        key={index}
                        source={{ uri: url }}
                        style={styles.image}
                      />
                    ))}
                  </ScrollView>
                  <View style={styles.pagination}>
                    {item.url.map((i, j) => (
                      <Text
                        key={j}
                        style={
                          j == active
                            ? styles.pagingActiveText
                            : styles.pagingText
                        }
                      >
                        ⬤
                      </Text>
                    ))}
                  </View>
                </View>
                <Paragraph>{item.description}</Paragraph>
              </Card.Content>
              <Card.Actions>
                {/* //need functionality for this to be unliked */}
                <Button mode="outlined" icon="heart-off">
                  Unlike
                </Button>
              </Card.Actions>
            </Card>
          ))
        ) : (
          <Text>You don't have any liked Snome's...GO check some out!</Text>
        )}
        {/* <Button onPress={getData} title="get data">Get Data</Button> */}
      </ScrollView>
    </View>
  );
}

const styles = {
  tinyLogo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34393B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    textShadowColor: 'blue',
  },
  container: {
    width,
    height: width * 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    display: 'flex',
    flex: 3,
    backgroundColor: '#EFEDE4',
    borderRadius: 5,
    padding: 5,
    margin: 20,
    shadowColor: '#470000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.9,
    elevation: 2,
  },
  imageContainer: { marginTop: 50, width, height },
  scroll: { width, height },
  image: { width, height, resizeMode: 'cover' },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  pagingText: { fontSize: width / 30, color: '#888', margin: 3 },
  pagingActiveText: { fontSize: width / 30, color: '#fff', margin: 3 },
};

export default MatchScreen;
