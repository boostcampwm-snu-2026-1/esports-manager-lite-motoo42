# 매치엔진 1차 챔피언 데이터 정리

매치엔진 2단계 작업에서 추가한 챔피언 풀입니다.

## 기준

- 데이터 출처: Riot Data Dragon
- Data Dragon 버전: `16.12.1`
- 아이콘 URL 형식: `https://ddragon.leagueoflegends.com/cdn/16.12.1/img/champion/{DataDragonId}.png`
- `내부 ID`는 게임 내부 밴픽/숙련도/선수 선호 챔피언 로직에서 쓰는 값입니다.
- `Data Dragon ID`는 Riot Data Dragon 이미지 파일명과 연결되는 값입니다.
- 라인 정보는 Data Dragon 공식 포지션이 아니라, 게임 밴픽용으로 직접 큐레이션한 값입니다.

## 요약

| 항목 | 수량 |
| --- | ---: |
| 전체 챔피언 | 79 |
| TOP | 20 |
| JUNGLE | 19 |
| MID | 20 |
| BOT | 17 |
| SUPPORT | 20 |
| 복수 라인 챔피언 | 16 |

## 복수 라인 챔피언

| 챔피언 | 등록 라인 | 내부 ID | Data Dragon ID |
| --- | --- | --- | --- |
| Rumble | TOP, MID | `rumble` | `Rumble` |
| Jayce | TOP, MID | `jayce` | `Jayce` |
| Gragas | TOP, JUNGLE | `gragas` | `Gragas` |
| Poppy | TOP, JUNGLE, SUPPORT | `poppy` | `Poppy` |
| Aurora | TOP, MID | `aurora` | `Aurora` |
| Maokai | JUNGLE, SUPPORT | `maokai` | `Maokai` |
| Taliyah | MID, JUNGLE | `taliyah` | `Taliyah` |
| Rell | SUPPORT, JUNGLE | `rell` | `Rell` |
| Wukong | JUNGLE, TOP | `wukong` | `MonkeyKing` |
| Diana | JUNGLE, MID | `diana` | `Diana` |
| Akali | MID, TOP | `akali` | `Akali` |
| Yone | MID, TOP | `yone` | `Yone` |
| Tristana | BOT, MID | `tristana` | `Tristana` |
| Ashe | BOT, SUPPORT | `ashe` | `Ashe` |
| Senna | BOT, SUPPORT | `senna` | `Senna` |
| Karma | SUPPORT, MID | `karma` | `Karma` |

## TOP

| 챔피언 | 내부 ID | Data Dragon ID | 등록 라인 |
| --- | --- | --- | --- |
| Aatrox | `aatrox` | `Aatrox` | TOP |
| K'Sante | `ksante` | `KSante` | TOP |
| Rumble | `rumble` | `Rumble` | TOP, MID |
| Gnar | `gnar` | `Gnar` | TOP |
| Renekton | `renekton` | `Renekton` | TOP |
| Jax | `jax` | `Jax` | TOP |
| Camille | `camille` | `Camille` | TOP |
| Ornn | `ornn` | `Ornn` | TOP |
| Sion | `sion` | `Sion` | TOP |
| Gwen | `gwen` | `Gwen` | TOP |
| Jayce | `jayce` | `Jayce` | TOP, MID |
| Kennen | `kennen` | `Kennen` | TOP |
| Gragas | `gragas` | `Gragas` | TOP, JUNGLE |
| Gangplank | `gangplank` | `Gangplank` | TOP |
| Fiora | `fiora` | `Fiora` | TOP |
| Poppy | `poppy` | `Poppy` | TOP, JUNGLE, SUPPORT |
| Aurora | `aurora` | `Aurora` | TOP, MID |
| Wukong | `wukong` | `MonkeyKing` | JUNGLE, TOP |
| Akali | `akali` | `Akali` | MID, TOP |
| Yone | `yone` | `Yone` | MID, TOP |

## JUNGLE

| 챔피언 | 내부 ID | Data Dragon ID | 등록 라인 |
| --- | --- | --- | --- |
| Gragas | `gragas` | `Gragas` | TOP, JUNGLE |
| Poppy | `poppy` | `Poppy` | TOP, JUNGLE, SUPPORT |
| Vi | `vi` | `Vi` | JUNGLE |
| Sejuani | `sejuani` | `Sejuani` | JUNGLE |
| Lee Sin | `lee-sin` | `LeeSin` | JUNGLE |
| Maokai | `maokai` | `Maokai` | JUNGLE, SUPPORT |
| Nidalee | `nidalee` | `Nidalee` | JUNGLE |
| Taliyah | `taliyah` | `Taliyah` | MID, JUNGLE |
| Rell | `rell` | `Rell` | SUPPORT, JUNGLE |
| Xin Zhao | `xin-zhao` | `XinZhao` | JUNGLE |
| Jarvan IV | `jarvan-iv` | `JarvanIV` | JUNGLE |
| Viego | `viego` | `Viego` | JUNGLE |
| Wukong | `wukong` | `MonkeyKing` | JUNGLE, TOP |
| Skarner | `skarner` | `Skarner` | JUNGLE |
| Nocturne | `nocturne` | `Nocturne` | JUNGLE |
| Kindred | `kindred` | `Kindred` | JUNGLE |
| Elise | `elise` | `Elise` | JUNGLE |
| Diana | `diana` | `Diana` | JUNGLE, MID |
| Graves | `graves` | `Graves` | JUNGLE |

## MID

| 챔피언 | 내부 ID | Data Dragon ID | 등록 라인 |
| --- | --- | --- | --- |
| Rumble | `rumble` | `Rumble` | TOP, MID |
| Jayce | `jayce` | `Jayce` | TOP, MID |
| Aurora | `aurora` | `Aurora` | TOP, MID |
| Taliyah | `taliyah` | `Taliyah` | MID, JUNGLE |
| Diana | `diana` | `Diana` | JUNGLE, MID |
| Azir | `azir` | `Azir` | MID |
| Orianna | `orianna` | `Orianna` | MID |
| Ahri | `ahri` | `Ahri` | MID |
| Corki | `corki` | `Corki` | MID |
| Syndra | `syndra` | `Syndra` | MID |
| LeBlanc | `leblanc` | `Leblanc` | MID |
| Sylas | `sylas` | `Sylas` | MID |
| Akali | `akali` | `Akali` | MID, TOP |
| Yone | `yone` | `Yone` | MID, TOP |
| Tristana | `tristana` | `Tristana` | BOT, MID |
| Viktor | `viktor` | `Viktor` | MID |
| Annie | `annie` | `Annie` | MID |
| Galio | `galio` | `Galio` | MID |
| Twisted Fate | `twisted-fate` | `TwistedFate` | MID |
| Karma | `karma` | `Karma` | SUPPORT, MID |

## BOT

| 챔피언 | 내부 ID | Data Dragon ID | 등록 라인 |
| --- | --- | --- | --- |
| Tristana | `tristana` | `Tristana` | BOT, MID |
| Jinx | `jinx` | `Jinx` | BOT |
| Zeri | `zeri` | `Zeri` | BOT |
| Kalista | `kalista` | `Kalista` | BOT |
| Xayah | `xayah` | `Xayah` | BOT |
| Varus | `varus` | `Varus` | BOT |
| Ezreal | `ezreal` | `Ezreal` | BOT |
| Kai'Sa | `kaisa` | `Kaisa` | BOT |
| Aphelios | `aphelios` | `Aphelios` | BOT |
| Caitlyn | `caitlyn` | `Caitlyn` | BOT |
| Ashe | `ashe` | `Ashe` | BOT, SUPPORT |
| Lucian | `lucian` | `Lucian` | BOT |
| Sivir | `sivir` | `Sivir` | BOT |
| Miss Fortune | `miss-fortune` | `MissFortune` | BOT |
| Draven | `draven` | `Draven` | BOT |
| Smolder | `smolder` | `Smolder` | BOT |
| Senna | `senna` | `Senna` | BOT, SUPPORT |

## SUPPORT

| 챔피언 | 내부 ID | Data Dragon ID | 등록 라인 |
| --- | --- | --- | --- |
| Poppy | `poppy` | `Poppy` | TOP, JUNGLE, SUPPORT |
| Maokai | `maokai` | `Maokai` | JUNGLE, SUPPORT |
| Rell | `rell` | `Rell` | SUPPORT, JUNGLE |
| Ashe | `ashe` | `Ashe` | BOT, SUPPORT |
| Senna | `senna` | `Senna` | BOT, SUPPORT |
| Rakan | `rakan` | `Rakan` | SUPPORT |
| Nautilus | `nautilus` | `Nautilus` | SUPPORT |
| Alistar | `alistar` | `Alistar` | SUPPORT |
| Lulu | `lulu` | `Lulu` | SUPPORT |
| Leona | `leona` | `Leona` | SUPPORT |
| Braum | `braum` | `Braum` | SUPPORT |
| Thresh | `thresh` | `Thresh` | SUPPORT |
| Renata Glasc | `renata-glasc` | `Renata` | SUPPORT |
| Milio | `milio` | `Milio` | SUPPORT |
| Nami | `nami` | `Nami` | SUPPORT |
| Karma | `karma` | `Karma` | SUPPORT, MID |
| Bard | `bard` | `Bard` | SUPPORT |
| Pyke | `pyke` | `Pyke` | SUPPORT |
| Blitzcrank | `blitzcrank` | `Blitzcrank` | SUPPORT |
| Yuumi | `yuumi` | `Yuumi` | SUPPORT |

## 전체 목록

| 챔피언 | 등록 라인 | 내부 ID | Data Dragon ID |
| --- | --- | --- | --- |
| Aatrox | TOP | `aatrox` | `Aatrox` |
| K'Sante | TOP | `ksante` | `KSante` |
| Rumble | TOP, MID | `rumble` | `Rumble` |
| Gnar | TOP | `gnar` | `Gnar` |
| Renekton | TOP | `renekton` | `Renekton` |
| Jax | TOP | `jax` | `Jax` |
| Camille | TOP | `camille` | `Camille` |
| Ornn | TOP | `ornn` | `Ornn` |
| Sion | TOP | `sion` | `Sion` |
| Gwen | TOP | `gwen` | `Gwen` |
| Jayce | TOP, MID | `jayce` | `Jayce` |
| Kennen | TOP | `kennen` | `Kennen` |
| Gragas | TOP, JUNGLE | `gragas` | `Gragas` |
| Gangplank | TOP | `gangplank` | `Gangplank` |
| Fiora | TOP | `fiora` | `Fiora` |
| Poppy | TOP, JUNGLE, SUPPORT | `poppy` | `Poppy` |
| Aurora | TOP, MID | `aurora` | `Aurora` |
| Vi | JUNGLE | `vi` | `Vi` |
| Sejuani | JUNGLE | `sejuani` | `Sejuani` |
| Lee Sin | JUNGLE | `lee-sin` | `LeeSin` |
| Maokai | JUNGLE, SUPPORT | `maokai` | `Maokai` |
| Nidalee | JUNGLE | `nidalee` | `Nidalee` |
| Taliyah | MID, JUNGLE | `taliyah` | `Taliyah` |
| Rell | SUPPORT, JUNGLE | `rell` | `Rell` |
| Xin Zhao | JUNGLE | `xin-zhao` | `XinZhao` |
| Jarvan IV | JUNGLE | `jarvan-iv` | `JarvanIV` |
| Viego | JUNGLE | `viego` | `Viego` |
| Wukong | JUNGLE, TOP | `wukong` | `MonkeyKing` |
| Skarner | JUNGLE | `skarner` | `Skarner` |
| Nocturne | JUNGLE | `nocturne` | `Nocturne` |
| Kindred | JUNGLE | `kindred` | `Kindred` |
| Elise | JUNGLE | `elise` | `Elise` |
| Diana | JUNGLE, MID | `diana` | `Diana` |
| Graves | JUNGLE | `graves` | `Graves` |
| Azir | MID | `azir` | `Azir` |
| Orianna | MID | `orianna` | `Orianna` |
| Ahri | MID | `ahri` | `Ahri` |
| Corki | MID | `corki` | `Corki` |
| Syndra | MID | `syndra` | `Syndra` |
| LeBlanc | MID | `leblanc` | `Leblanc` |
| Sylas | MID | `sylas` | `Sylas` |
| Akali | MID, TOP | `akali` | `Akali` |
| Yone | MID, TOP | `yone` | `Yone` |
| Tristana | BOT, MID | `tristana` | `Tristana` |
| Viktor | MID | `viktor` | `Viktor` |
| Annie | MID | `annie` | `Annie` |
| Galio | MID | `galio` | `Galio` |
| Twisted Fate | MID | `twisted-fate` | `TwistedFate` |
| Jinx | BOT | `jinx` | `Jinx` |
| Zeri | BOT | `zeri` | `Zeri` |
| Kalista | BOT | `kalista` | `Kalista` |
| Xayah | BOT | `xayah` | `Xayah` |
| Varus | BOT | `varus` | `Varus` |
| Ezreal | BOT | `ezreal` | `Ezreal` |
| Kai'Sa | BOT | `kaisa` | `Kaisa` |
| Aphelios | BOT | `aphelios` | `Aphelios` |
| Caitlyn | BOT | `caitlyn` | `Caitlyn` |
| Ashe | BOT, SUPPORT | `ashe` | `Ashe` |
| Lucian | BOT | `lucian` | `Lucian` |
| Sivir | BOT | `sivir` | `Sivir` |
| Miss Fortune | BOT | `miss-fortune` | `MissFortune` |
| Draven | BOT | `draven` | `Draven` |
| Smolder | BOT | `smolder` | `Smolder` |
| Senna | BOT, SUPPORT | `senna` | `Senna` |
| Rakan | SUPPORT | `rakan` | `Rakan` |
| Nautilus | SUPPORT | `nautilus` | `Nautilus` |
| Alistar | SUPPORT | `alistar` | `Alistar` |
| Lulu | SUPPORT | `lulu` | `Lulu` |
| Leona | SUPPORT | `leona` | `Leona` |
| Braum | SUPPORT | `braum` | `Braum` |
| Thresh | SUPPORT | `thresh` | `Thresh` |
| Renata Glasc | SUPPORT | `renata-glasc` | `Renata` |
| Milio | SUPPORT | `milio` | `Milio` |
| Nami | SUPPORT | `nami` | `Nami` |
| Karma | SUPPORT, MID | `karma` | `Karma` |
| Bard | SUPPORT | `bard` | `Bard` |
| Pyke | SUPPORT | `pyke` | `Pyke` |
| Blitzcrank | SUPPORT | `blitzcrank` | `Blitzcrank` |
| Yuumi | SUPPORT | `yuumi` | `Yuumi` |
