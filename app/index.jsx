import {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { data } from "@/data/todos";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { Oswald_400Regular, useFonts } from "@expo-google-fonts/oswald";
import Animated, { LinearTransition } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

export default function Index() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [loaded, error] = useFonts({ Oswald_400Regular });
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const router = useRouter();

  const styles = createStyles(theme, colorScheme);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("TodoApp");
        const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null;

        if (storageTodos && storageTodos.length) {
          setTodos(storageTodos.sort((a, b) => b.id - a.id));
        } else {
          setTodos(data.sort((a, b) => b.id - a.id));
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [data]);

  useEffect(() => {
    const storeData = async () => {
      try {
        const jsonValue = JSON.stringify(todos);

        await AsyncStorage.setItem("TodoApp", jsonValue);
      } catch (e) {
        console.error(e);
      }
    };

    storeData();
  }, [todos]);

  if (!loaded && !error) {
    return null;
  }

  const addTodo = () => {
    if (text.trim()) {
      const newId = todos.length > 0 ? todos[0].id + 1 : 1;

      setTodos([{ id: newId, title: text, completed: false }, ...todos]);
      setText("");
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handlePress = (id) => {
    router.push(`/todos/${id}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <Pressable
        onPress={() => handlePress(item.id)}
        onLongPress={() => toggleTodo(item.id)}
      >
        <Text style={[styles.todoText, item.completed && styles.completedText]}>
          {item.title}
        </Text>
      </Pressable>

      <Pressable onPress={() => removeTodo(item.id)}>
        <MaterialCommunityIcons
          name="delete-circle-outline"
          size={36}
          color="#ff6622"
          selectable={undefined}
        />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a todo..."
          placeholderTextColor="gray"
          value={text}
          onChangeText={setText}
        />

        <Pressable onPress={addTodo} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }
          style={{ marginLeft: 10, userSelect: "none" }}
        >
          {colorScheme === "dark" ? (
            <Octicons
              name="sun"
              size={36}
              color="#ffcc22"
              selectable={undefined}
              style={{ width: 36 }}
            />
          ) : (
            <Octicons
              name="moon"
              size={36}
              color="#242424"
              selectable={undefined}
              style={{ width: 36 }}
            />
          )}
        </Pressable>
      </View>

      <Animated.FlatList
        style={styles.list}
        data={todos}
        renderItem={renderItem}
        keyExtractor={(todo) => todo.id}
        contentContainerStyle={{ flexGrow: 1 }}
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode="on-drag"
      />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </SafeAreaView>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      padding: 10,
      width: "100%",
      maxWidth: 1024,
      marginHorizontal: "auto",
      marginTop: 25,
      pointerEvents: "auto",
    },
    input: {
      flex: 1,
      borderColor: "gray",
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 15,
      paddingVertical: 5,
      marginRight: 10,
      fontFamily: "Oswald_400Regular",
      fontSize: 20,
      color: theme.text,
      minWidth: 0,
      letterSpacing: 2,
    },
    addButton: {
      padding: 10,
      backgroundColor: "white",
      borderRadius: 5,
      color: "#242424",
    },
    addButtonText: {
      fontSize: 20,
      color: colorScheme === "dark" ? "black" : "#242424",
    },
    todoItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 4,
      padding: 10,
      borderColor: "gray",
      borderBottomColor: "gray",
      borderWidth: 2,
      width: "100%",
      maxWidth: 1024,
      marginHorizontal: "auto",
      marginBottom: 5,
      pointerEvents: "auto",
      borderRadius: 5,
    },
    todoText: {
      flex: 1,
      fontFamily: "Oswald_400Regular",
      fontSize: 20,
      color: theme.text,
    },
    completedText: {
      fontFamily: "Oswald_400Regular",
      textDecorationLine: "line-through",
      color: "gray",
    },
  });
}
