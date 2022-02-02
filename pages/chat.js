import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import { useRouter } from 'next/router';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import { ButtonSendSticker }from '../src/components/ButtonSendSticker';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzgxMTA4NiwiZXhwIjoxOTU5Mzg3MDg2fQ.ojc9_Aqu4UNaeYP8HMl66P28EAfbPOMhagjNSwUknlI';
const SUPABASE_URL = 'https://nobfhotqjxqeqitjrnzr.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensRealtime(adicionaMensagem) {
    // para ativar o realtime no supabase: projeto > database > replication > seleciona a tabela
    return supabaseClient
    .from('mensagens')
    .on('INSERT', (res) => {
        adicionaMensagem(res.new);
    })
    .subscribe();
}

export default function ChatPage() {
    
    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username;
    const [mensagem, setMensagem] = React.useState('');
    const [listaMensagens, setListaMensagens] = React.useState([]);

    React.useEffect(() => {
        supabaseClient
            .from('mensagens')
            .select('*')
            .order('id', { ascending: false })
            .then((res) => {
                setListaMensagens(res.data);
                escutaMensagensRealtime((novaMensagem) => {
                    setListaMensagens((listaAtual) => {
                        return [
                            novaMensagem,
                            ...listaAtual,
                        ]
                    });
                })
            });
    }, []);

    function handleNovaMensagem(novaMensagem) {
        const mensagem = {            
            //id: listaMensagens.length
            de: usuarioLogado,
            texto: novaMensagem,
        }

        supabaseClient
            .from('mensagens')
            .insert([
                mensagem
            ])
            .then((res) => {
                // setListaMensagens([
                //     res.data[0],
                //     ...listaMensagens,
                // ]);
            })

        setMensagem('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                // backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://i.pinimg.com/originals/43/0e/9a/430e9abb2039e992275efb898c5948c1.gif)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    <MessageList mensagens={listaMensagens} />
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={ (event) => {
                                const valor = event.target.value;
                                setMensagem(valor);
                            }}
                            onKeyPress={ (event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    
                                    handleNovaMensagem(mensagem);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker onStickerClick={(sticker) => {
                            handleNovaMensagem(`:sticker: ${sticker}`);
                        }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagemAtual) => {
                return (
                    <Text
                        key={mensagemAtual.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                    <Box
                        styleSheet={{
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            styleSheet={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'inline-block',
                                marginRight: '8px',
                            }}
                            src={`https://github.com/${mensagemAtual.de}.png`}
                        />
                                <Text tag="strong">
                                    {mensagemAtual.de}
                                </Text>
                        <Text
                            styleSheet={{
                                fontSize: '10px',
                                marginLeft: '8px',
                                color: appConfig.theme.colors.neutrals[300],
                            }}
                            tag="span"
                        >
                            {(new Date().toLocaleDateString())}
                        </Text>
                    </Box>
                    {mensagemAtual.texto.startsWith(':sticker:') ? (
                        <Image src={mensagemAtual.texto.replace(':sticker:', '')} />
                    )
                    : (
                        mensagemAtual.texto
                    )}
                </Text>
                )
            })}            
        </Box>
    )
}