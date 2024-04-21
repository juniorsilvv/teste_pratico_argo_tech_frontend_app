import { useRef, useCallback, useMemo, useState, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Button, ToastAndroid, Alert, TouchableOpacity } from 'react-native'
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import BotomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import CheckBox from 'expo-checkbox'
import FAB from '../components/FAB';
import Request from '../components/Request';

type tasks = {
    id: number,
    title: string,
    description: string,
    status: boolean
}

export default function Home() {

    const bottomSheetRef = useRef<BotomSheet>(null);
    const snapPoints = useMemo(() => ["30%", "60%"], []);
    const [tasks, setTasks] = useState<tasks[]>([]);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [onPressFunction, setOnPressFunction] = useState('validateTodo');
    const [idTask, setIdTask] = useState<number>();



    /** Alert */
    const toastr = (text: string) => {
        ToastAndroid.show(text, 100)
    }
    /** Valida conteudo */
    const validateTodo = async (title: string, description: string) => {

        if (!title) return toastr('Título é obrigátorio')
        if (!description) return toastr('Descrição é obrigátorio')

        let data = {
            title: title,
            description: description
        };
        let newTask = await Request('create', 'POST', data);
        addTask(newTask);
    
    }

    /** Adiciona a nova task no object tasks */
    const addTask = (task:tasks) => {
        ToastAndroid.show('Nova tarefa adicionada', 100)
        setTitle('');
        setDescription('');
        handleCloseAction()
        setTasks(prevTasks => {
            if (prevTasks === undefined) {
                return [task];
            } else {
                return [...prevTasks, task];
            }
        });
       
    }

    /** Busca a lista de tarefas  */
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Realize a requisição para obter as tarefas
                const fetchedTasks = await Request('all', 'GET');
                setTasks(fetchedTasks);
            } catch (error) {
                console.error('Erro ao buscar as tarefas:', error);
            }
        };

        fetchData();
    }, []);


    /** Esconde o BotomSheet */
    const handleCloseAction = () => bottomSheetRef.current?.close();

    /** Exibe o BotomSheet */
    const handleOpenPress = () => bottomSheetRef.current?.expand()

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1} // O backdrop não desaparece
                appearsOnIndex={0} // O backdrop aparece quando o BottomSheet está aberto
                opacity={0.5} // Opacidade do backdrop
            />
        ),
        []
    );

    /** Marca a task como concluida ou pendente */
    const alterStatus = async (id: number) => {
        // Mapeie as tarefas para uma matriz de Promises
        const updatedTasksPromises = tasks.map(async task => {
            if (task.id === id) {
                // Faça a requisição e aguarde sua conclusão
                await Request(`update/status/${id}`, 'PUT', { 'status': !task.status });
                // Atualize o status da tarefa
                return { ...task, status: !task.status };
            }
            return task;
        });

        try {
            // Aguarde a resolução de todas as Promises
            const updatedTasks = await Promise.all(updatedTasksPromises);
            // Atualize o estado com as tarefas atualizadas
            setTasks(updatedTasks);
        } catch (error) {
            console.error('Erro ao atualizar tarefas:', error);
        }
    };

    /** Mostra alert para o usuário confirmar de deseja apagar task mesmo */
    const showAlertDelete = (id: number) => {
        Alert.alert(
            'deseja mesmo apagar?',
            'Essa tarega será perdida',
            [
                {
                    text: 'Sim',
                    onPress: () => deleteTask(id),
                    style: 'cancel',
                },
            ],
            {
                cancelable: true
            },
        );
    }

    /** Apagando a task */
    const deleteTask = (id: number) => {
        Request(`delete/${id}`, 'DELETE');
        const updatedTasks = tasks.filter(task => task.id !== id);
        // Atualize o estado das tarefas com o novo array
        setTasks(updatedTasks);
    }

    const showBottomSheetEditTask = (id:number, title:string, description:string) => {
        setTitle(title)
        setDescription(description)
        setIdTask(id)

        handleOpenPress()
        setOnPressFunction('editTask')
    } 


    /**
     * 
     * Edita Tarefa
     * @param title 
     * @param description 
     */
    const editTask = async (title:string, description:string) => {

        if (!title) return toastr('Título é obrigátorio')
        if (!description) return toastr('Descrição é obrigátorio')
    
        let data = {
            title: title,
            description: description
        };

        let task:tasks = await Request(`update/${idTask}`, 'PUT', data);

        const updatedTasksPromises = tasks.map(task => {
            if (task.id === idTask) {
                return { ...task, title: title, description: description};
            }
            return task;
        });

        setIdTask(undefined);
        setTitle('');
        setDescription('');
        setTasks(updatedTasksPromises);
        setOnPressFunction('validateTodo')
        handleCloseAction()
        toastr('Tarefa atualizada');
    }

    /**
     * Define no meu BotomSheet qual função será chamada
     * Criar ou editar tarefa
     */
    const choosenFunction = () => {
            
        if(onPressFunction == 'validateTodo')
            validateTodo(title, description)
        else
            editTask(title, description)

    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

                <View style={styles.container}>
                    {tasks.map((value, key) => (
                        <TouchableOpacity onPress={() => {showBottomSheetEditTask(value.id, value.title, value.description)}}                             key={value.id} 
                        >
                        <View 
                            style={
                            [styles.row,
                            { borderLeftColor: value.status ? '#5fd788' : 'red' }]}
                        >
                            <View>
                                <Text>{value.title}</Text>
                                <Text>{value.description}</Text>
                            </View>
                            <View style={styles.actions}>
                                <CheckBox
                                    value={value.status == true ? true : false}
                                    onValueChange={() => alterStatus(value.id)}
                                />
                                <Pressable style={styles.actiondelete} onPress={() => showAlertDelete(value.id)}>
                                    <Text style={{ color: 'white' }}>X</Text>
                                </Pressable>
                            </View>
                        </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <FAB onPress={handleOpenPress} title={'Add'}> </FAB>
                <BotomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    backgroundStyle={styles.sheet}
                    enablePanDownToClose={true}
                    backdropComponent={renderBackdrop}
                >
                    <View style={styles.content}>
                        <Text style={styles.h1}>adicionar tarefa</Text>
                        <TextInput
                            value={title}
                            style={styles.inputText}
                            placeholder={'título'}
                            onChangeText={title => { setTitle(title) }}
                        />
                        <TextInput
                            value={description}
                            multiline={true}
                            numberOfLines={10}
                            placeholder='descrição'
                            style={styles.inputText}
                            onChangeText={description => setDescription(description)}
                        />

                        <Pressable style={styles.send} onPress={choosenFunction}>
                            <Text style={{ color: '#fff' }}>
                                Salvar
                            </Text>
                        </Pressable>
                    </View>
                </BotomSheet>
            </View>
        </GestureHandlerRootView>
    )
}



const styles = StyleSheet.create({
    sheet: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50,
        position: "absolute",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    title: {
        fontSize: 25,
        color: "#fff",
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 15
    },
    h1: {
        fontWeight: '300',
        fontSize: 18,
        paddingBottom: 24
    },
    inputText: {
        width: '100%',
        fontSize: 14,
        lineHeight: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        borderColor: '#31394fb3',
        backgroundColor: '#f8fafc',
        marginBottom: 20
    },
    send: {
        fontSize: 20,
        backgroundColor: '#656cfd',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },
    container: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        marginTop: 30
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        fontSize: 14,
        lineHeight: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderLeftWidth: 5,
        borderLeftColor: '#5fd788',
        borderEndColor: '#f8fafc',
        borderTopColor: '#f8fafc',
        borderBottomColor: '#f8fafc',
        marginBottom: 10
    },
    buttonDelete: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        backgroundColor: 'red',
        padding: 5,
        borderRadius: 50
    },
    buttonDeleteText: {
        color: 'white'
    },
    actions: {
        display: 'flex',
        flexDirection: 'row',
        width: '30%',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    actiondelete: {
        padding: 8,
        backgroundColor: 'red',
        borderRadius: 50
    }
}); 