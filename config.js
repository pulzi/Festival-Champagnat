// ============================================================
//  EDITE AQUI: nome, contatos, data e nomes dos álbuns.
//  O site inteiro lê daqui.
// ============================================================
window.CONFIG = {
  nome: 'Leonardo Pulzi',
  serie: 'Aluno do Marista Arquidiocesano',   // deixe '' para esconder
  instagram: 'leonardo.pulzi',                // sem o @
  email: 'leonardopulzi@gmail.com',
  evento: 'Festival Champagnat',
  data: 'Data do festival',                   // ex.: 'Sábado, 18 de outubro'
  local: 'Colégio Marista Arquidiocesano',
  albumUrl: '',                               // link do Google Fotos com o álbum completo

  // Cada subpasta de "fotos" vira um álbum. O nome da pasta (sem acento,
  // minúsculo) escolhe o título abaixo. Pasta nova sem título aqui usa o nome dela.
  albuns: {
    palco:    { titulo: 'Palco e apresentações', emoji: '🎤', desc: 'Danças, bandas e tudo que rolou lá em cima.' },
    barracas: { titulo: 'Barracas e comidas',    emoji: '🍿', desc: 'Fila, cheiro bom e muita gente feliz.' },
    turma:    { titulo: 'Turma e retratos',      emoji: '👥', desc: 'A galera posando (ou fingindo que não).' },
    momentos: { titulo: 'Momentos',              emoji: '✨', desc: 'Os cliques espontâneos que ninguém viu chegando.' },
    videos:   { titulo: 'Vídeos GoPro',          emoji: '🎥', desc: 'O festival em movimento, de pertinho.' },
  },
};
