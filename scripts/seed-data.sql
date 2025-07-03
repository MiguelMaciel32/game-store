-- Dados iniciais para o banco

-- Inserir conquistas padrão
INSERT INTO achievements (title, description, icon, points, requirement_type, requirement_value) VALUES
('Primeiro Passo', 'Faça seu primeiro login', '🎯', 10, 'LOGIN_COUNT', 1),
('Comprador', 'Compre seu primeiro jogo', '🛒', 25, 'GAMES_PURCHASED', 1),
('Colecionador', 'Compre 10 jogos', '📚', 100, 'GAMES_PURCHASED', 10),
('Investidor', 'Gaste R$ 100 em jogos', '💰', 150, 'MONEY_SPENT', 10000),
('Veterano', 'Jogue por 100 horas', '⏰', 200, 'HOURS_PLAYED', 6000),
('Socializar', 'Envie 50 mensagens no chat', '💬', 75, 'CHAT_MESSAGES', 50),
('Madrugador', 'Jogue às 6h da manhã', '🌅', 50, 'EARLY_BIRD', 1),
('Noturno', 'Jogue após meia-noite', '🌙', 50, 'NIGHT_OWL', 1);

-- Inserir jogos de exemplo
INSERT INTO games (title, description, price, category, tags, image_url, rating) VALUES
('Valorant', 'FPS tático competitivo da Riot Games', 0.00, 'FPS', ARRAY['Gratuito', 'Competitivo', 'Tático'], '/placeholder.svg?height=300&width=400&text=Valorant', 4.5),
('CS:GO', 'Counter-Strike: Global Offensive', 0.00, 'FPS', ARRAY['Gratuito', 'Competitivo', 'Clássico'], '/placeholder.svg?height=300&width=400&text=CS:GO', 4.3),
('Fortnite', 'Battle Royale com construção', 0.00, 'Battle Royale', ARRAY['Gratuito', 'Battle Royale', 'Construção'], '/placeholder.svg?height=300&width=400&text=Fortnite', 4.2),
('Minecraft', 'Jogo de construção e sobrevivência', 89.90, 'Sandbox', ARRAY['Sandbox', 'Criatividade', 'Sobrevivência'], '/placeholder.svg?height=300&width=400&text=Minecraft', 4.8),
('The Witcher 3', 'RPG de mundo aberto épico', 59.90, 'RPG', ARRAY['RPG', 'Mundo Aberto', 'História'], '/placeholder.svg?height=300&width=400&text=Witcher+3', 4.9),
('Cyberpunk 2077', 'RPG futurístico em Night City', 199.90, 'RPG', ARRAY['RPG', 'Futurístico', 'Ação'], '/placeholder.svg?height=300&width=400&text=Cyberpunk', 4.1);
