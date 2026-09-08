# IdleMMO — Base de connaissances auto-référente

> **Pour l’agent :** charge ce fichier entierement au début d’une session IdleMMO.
> Navigue via les ancres. Chaque section renvoie vers les autres. Après chaque
> découverte UI/gameplay, mets à jour [§ Mémoire runtime](#mémoire-runtime).
>
> Sources officielles : [wiki.idle-mmo.com](https://wiki.idle-mmo.com/) ·
> Jeu : [web.idle-mmo.com](https://web.idle-mmo.com/)
>
> Dernière synthèse wiki : 2026-09-08

## Table des matières

1. [Contrôle agent](#contrôle-agent)
2. [Boucle autonome](#boucle-autonome)
3. [Cœur du jeu](#cœur-du-jeu)
4. [UI & navigation](#ui--navigation)
5. [Vérification](#vérification)
6. [Personnage & classes](#personnage--classes)
7. [Stats](#stats)
8. [Skills (compétences)](#skills-compétences)
9. [Mining playbook](#mining-playbook)
10. [Woodcutting / Fishing / Cooking](#woodcutting--fishing--cooking)
11. [Smelting / Forge / Alchemy](#smelting--forge--alchemy)
12. [Construction (Houses)](#construction-houses)
13. [Village Mastery](#village-mastery)
14. [Meditation](#meditation)
15. [Map & travelling](#map--travelling)
16. [Combat : Hunting → Battling](#combat--hunting--battling)
17. [Dungeons](#dungeons)
18. [World Bosses](#world-bosses)
19. [Quests](#quests)
20. [Économie (Market / Merchants / Trading)](#économie)
21. [Items & equipment](#items--equipment)
22. [Pets](#pets)
23. [Membership & daily](#membership--daily)
24. [Ascension](#ascension)
25. [Guilds](#guilds)
26. [Effects & Magic Find](#effects--magic-find)
27. [Progression playbooks](#progression-playbooks)
28. [Décision : que faire maintenant ?](#décision--que-faire-maintenant)
29. [Apprentissage continu](#apprentissage-continu)
30. [Mémoire runtime](#mémoire-runtime)
31. [Index wiki](#index-wiki)

---

## Contrôle agent

**Objectif :** piloter le Chrome du Desktop Ubuntu Cursor (`DISPLAY=:1`), pas le PC local.

### Primitives (rapides)

```bash
export DISPLAY=:1

# Clic unique
xdotool mousemove X Y sleep 0.1 click 1

# Séquence (ex. Coal → Start)
xdotool mousemove 913 422 sleep 0.15 click 1
sleep 0.7
xdotool mousemove 992 739 sleep 0.15 click 1

# Lire position souris (pour calibrage avec l’utilisateur)
xdotool getmouselocation --shell

# Capture
ffmpeg -y -f x11grab -video_size 1920x1200 -i :1 -frames:v 1 /tmp/idle-check.png
```

### Règles de ciblage

| Situation | Méthode |
|-----------|---------|
| Coords connues ([§ Mémoire runtime](#mémoire-runtime)) | `xdotool` direct (~1s) |
| Élément inconnu / 1ère fois | Screenshot → lire labels EN → demander coords OU Computer Use |
| 1–2 clics simples | **Jamais** lancer un sous-agent Computer Use (trop lent) |
| Parcours long (Map, quests, market) | Computer Use OK, ou coords progressives |

### Calibration avec l’utilisateur

Demander le format :
```
<label>: x=<X> y=<Y>
```
Puis stocker dans [§ Mémoire runtime](#mémoire-runtime).

→ Retour [Boucle autonome](#boucle-autonome)

---

## Boucle autonome

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ OBSERVE  │ → │  DECIDE  │ → │ NAVIGATE │ → │   ACT    │ → │  VERIFY  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
      ↑                                                           │
      └──────────────── LEARN (update mémoire) ←──────────────────┘
```

### OBSERVE

Lire / capturer :
- **Current Action** (droite) : action en cours + timer
- **Location** (souvent dans header / map)
- **Gold**, inventaire (slots libres ?)
- Skills levels (sidebar)
- Checklist Getting Started (profil) si early game

### DECIDE

Voir [§ Décision](#décision--que-faire-maintenant) et [§ Progression](#progression-playbooks).

### NAVIGATE

Labels UI **anglais** (sidebar) :
`Overview` · `Profile` · `Inventory` · `Map` · `Party` · skills list
(`Woodcutting`, `Mining`, `Fishing`, `Alchemy`, `Smelting`, `Cooking`, `Forge`, …)

URLs utiles :
- Mining : `/skills/view/mining`
- Profile : `/@<Name>`

### ACT

Lancer l’action idle (skill item → **Start**, ou Battle, Hunt, Dungeon, Travel).

### VERIFY

Voir [§ Vérification](#vérification).

### LEARN

Si succès/échec inattendu → noter dans [§ Mémoire runtime](#mémoire-runtime) + éventuellement re-fetch wiki section.

→ [Cœur du jeu](#cœur-du-jeu)

---

## Cœur du jeu

IdleMMO = **start → idle → collect → next action**.

- Une action tourne jusqu’à : fin de stack / idle max / cancel / défaite.
- Idle max typique : **~6h** (main free) · **~8h** (main member) · alts plus courts (voir [Membership](#membership--daily)).
- Les skills génèrent des items en continu pendant l’idle.
- La map débloque lieux, ores, arbres, poissons, mobs, dungeons.
- Boucle économie : gather → process (cook/smelt/forge) → use / sell ([Économie](#économie)).

Wiki : [Introduction](https://wiki.idle-mmo.com/getting-started/introduction)

→ [UI & navigation](#ui--navigation)

---

## UI & navigation

### Sidebar Character
- Overview, Profile, Inventory, Map, Party

### Sidebar Skills
Chaque skill a une page liste d’items (ex. ores) avec : level requis, EXP, temps/cycle, chevron `>`.

Pattern standard skill :
1. Cliquer le skill (sidebar)
2. Cliquer la ligne de ressource (ex. `Coal Ore`)
3. Dans la modale : **Start**
4. Vérifier **Current Action**

### Current Action (panneau droit)
Montre l’action active : icône, barre, `Next item in …`, EXP/s, timer idle restant, boutons refresh / cancel (X).

### Getting Started (Profile)
Checklist early game (ex. Mine ore). Utile pour prioriser si incomplet.

→ [Vérification](#vérification) · [Mining playbook](#mining-playbook)

---

## Vérification

Une action est **réussie** seulement si :

1. Modale fermée **et**
2. **Current Action** affiche la bonne ressource/skill **et**
3. Timer / `Next item in` avance **et**
4. Progress / items gathered augmente après quelques cycles

Échecs courants :
| Symptôme | Cause probable | Suite |
|----------|----------------|-------|
| Start ferme la modale, rien dans Current Action | Mauvais clic / mauvais ore / prérequis outil | Recaler coords, check pickaxe |
| Level requis rouge | Skill level trop bas | Choisir item de niveau ≤ skill |
| Inventaire plein | Plus de slots | Vendre / bank / merchant slots |
| Message map / resources | Besoin d’explorer | [Map](#map--travelling) |
| Action déjà en cours | Idle occupé | Cancel puis relancer, ou laisser finir |

→ [Boucle autonome](#boucle-autonome)

---

## Personnage & classes

Wiki : [Classes](https://wiki.idle-mmo.com/character/classes)

### Limites compte
- Jusqu’à **5** personnages, **3** actions idle simultanées pour classes avec accès market.
- Classes **sans market** (Banished, Cursed) : **hors** de la limite des 3.
- Alts : total level **150** pour market / trades.

### Changer de classe
- Item **Metamorphite** (vendor) · 1× / 14 jours · non tradable.
- **Forsaken / Cursed / Banished** : locked (pas de switch).

### Classes skilling (+10% eff +10% EXP)
| Class | Focus |
|-------|-------|
| Miner | Mining |
| Angler | Fishing |
| Chef | Cooking |
| Lumberjack | Woodcutting |
| Smelter | Smelting |

### Classes combat
| Class | Effets clés |
|-------|-------------|
| Warrior | +10% Str EXP, +5% Battle EXP, +5% Hunt eff |
| Shadowblade | +5% Speed EXP, +10% Hunt, +5% Battle |
| Ranger | +7% Dex EXP, +8% Hunt, +5% Battle |
| Beastmaster | +10% Pet Mastery / Pet EXP |

### Challenge classes
| Class | Effet |
|-------|-------|
| Banished | Pas de market/trade · -0% EXP · TP −50% |
| Forsaken | −50% skill/battle/dungeon EXP · market OK |
| Cursed | Banished + Forsaken penalties · TP −50% |

→ [Stats](#stats) · [Progression](#progression-playbooks)

---

## Stats

Wiki : [Stats](https://wiki.idle-mmo.com/character/stats)

| Stat | Effet |
|------|-------|
| Strength | +2.4 Attack Power / level |
| Defence | +2.4 Protection / level |
| Speed | +2.4 Agility / level |
| Dexterity | +2.4 Accuracy / level |
| Critical Chance / Damage | Crit |
| Movement Speed | Travel + hunt speed (pets/equipment) |
| Attack Power / Protection / Agility / Accuracy | Stats de combat dérivées |
| Damage | Flat damage ajouté |

Skill → stats passives ([Skills overview](https://wiki.idle-mmo.com/skills/overview)) :
| Skill | Stats |
|-------|-------|
| Woodcutting | Strength |
| Mining | Strength, Defense |
| Fishing | Dexterity |
| Alchemy / Smelting | Speed |
| Cooking | Dexterity |
| Forge / Construction | Strength |

→ [Combat](#combat--hunting--battling)

---

## Skills (compétences)

Wiki : [Skills overview](https://wiki.idle-mmo.com/skills/overview)

### Gathering / crafting
Woodcutting · Mining · Fishing · Alchemy · Smelting · Cooking · Forge · Construction

### Autres
Village Mastery · Meditation · Hunting Mastery · Guild Mastery · Combat · Dungeoneering · Bartering · Pet Mastery · event masteries (Shadow/Yule/Springtide/Lunar) · Slayer (**unreleased**)

### Outils
| Skill | Tool |
|-------|------|
| Mining | Pickaxe |
| Fishing | Fishing Rod (+ bait) |
| Woodcutting | Felling Axe |

Meilleurs outils = actions plus rapides → [Items](#items--equipment).

### Bartering
Vendre au vendor → jusqu’à **+20%** gold · cap **20k EXP / item**.

→ Playbooks : [Mining](#mining-playbook) · [WC/Fish/Cook](#woodcutting--fishing--cooking) · [Smelt/Forge/Alch](#smelting--forge--alchemy)

---

## Mining playbook

**But :** ores → smelting / cooking fuel (Coal) / gold.

### Early game (wiki intro)
1. Mine **Coal Ore** (~douzaine)
2. Vendre **moitié** au market (~5g/u typique, variable)
3. Garder Coal pour Cooking / Smelting

### Procédure UI (session validée)
1. Sidebar → **Mining**
2. Clic ligne **Coal Ore** (coords connues : voir mémoire)
3. Clic **Start**
4. Vérifier Current Action = Coal Ore

### Autres ores (ordre de niveau)
Coal · Tin · … · Limestone (souvent Lv.10+, mining) — toujours choisir un ore **≤ Mining level** (label rouge = bloqué).

### Synergies
- Coal → [Cooking](#woodcutting--fishing--cooking) + [Smelting](#smelting--forge--alchemy)
- Ores → bars → [Forge](#smelting--forge--alchemy)
- Limestone → Construction materials ([Construction](#construction-houses))
- Class **Miner** pour booster

→ [Décision](#décision--que-faire-maintenant)

---

## Woodcutting / Fishing / Cooking

### Woodcutting
- Logs → Forge (arcs, etc.) + Construction planks/beams
- Tool : Felling Axe
- Class : Lumberjack

### Fishing
- Besoin de **bait** (~2g vendor / General Goods — Melriel)
- Early : **Cod** → sell half / cook half
- Class : Angler

### Cooking
- Raw fish → cooked (souvent **1 Coal** / cook)
- Cooked = food de combat (effective HP) + pets hunger/health
- Vend mieux que raw
- Class : Chef

Boucle starter wiki : Coal → sell → bait → fish Cod → cook → battle Rabbits → sell surplus.

→ [Combat](#combat--hunting--battling) · [Économie](#économie)

---

## Smelting / Forge / Alchemy

### Smelting
Ore → Metal Bars · Class Smelter · stats Speed

### Forge
Craft equipment via **Recipes** (dungeons / market) + materials (bars, logs, crafting mats)
→ [Dungeons](#dungeons) · [Equipment](#items--equipment)

### Alchemy
Potions (durée réelle, ex. 30 min) · Essence Crystals (par **action**, jusqu’à cancel/refresh)
Empty vials / crystals chez vendor.

**Note effects :** boosts s’appliquent aux actions **démarrées après** activation ; refresh si besoin.

→ [Effects](#effects--magic-find)

---

## Construction (Houses)

Wiki : [Construction](https://wiki.idle-mmo.com/skills/construction)

- Foundation : **25 000 gold**, **6h**, lieu **permanent**
- Composants : idle time / stats / guests / Remote Conduit (bonus partout)
- Decay : 45j (free) / 60j (member) · réparer avant ~80%
- Matériaux : Clay, Sand, Planks, Beams, Brick, Iron Fitting, Glass, Limestone (**mined**)
- Gather materials seulement avec accès house (own ou guest) · même lieu sauf Remote Conduit
- Guests : Guest Quarters I–III · Cursed/Banished **ne peuvent pas** être guests
- Idle extenders exemples Mining : Ore Cellar I–V (+30m → +4h)

→ [Village Mastery](#village-mastery) · [Décision](#décision--que-faire-maintenant)

---

## Village Mastery

Wiki : [Village Mastery](https://wiki.idle-mmo.com/skills/village-mastery)

Skill avancé : VR (Village Resources) ≠ gold.

Loop : dwellings → food → gathering houses staffées → collect VR → build/repair/trade/warfare.

Base : 125 VR/min · 625k storage · 2 citizens · food for 2.

Upgrade cap croît avec le niveau (Lv1:7 … Lv99:30).

Sell VR→gold : ~1350 VR/1g (free) · ~1150 (member).

XP : gather/collect seulement · **pas** affecté par EXP boosts.

→ [Économie](#économie)

---

## Meditation

Wiki : [Meditation](https://wiki.idle-mmo.com/skills/meditation)

- Idle EXP : **0.8 /s**
- Lv35+ : Guidance Scrolls (Blank Scroll vendor) · **60 min** / scroll · **0.1 EXP/s** en écrivant
- Scrolls : boost **2h** pour **autres joueurs** (pas self/alts)
- Bonus 1%→15% selon level (EXP type a / Magic Find type b)
- Banished/Cursed : restrictions trade scrolls
- Lv100 : Enlightenment (cosmétique)

→ [Effects](#effects--magic-find)

---

## Map & travelling

Wiki : [Travelling](https://wiki.idle-mmo.com/activities-and-challenges/travelling)

1. Sidebar **Map**
2. Choisir destination · Movement Speed ↓ temps de trajet
3. Coût téléport ↑ avec total level (sauf skills whitelist : event masteries, Guild Mastery, Meditation)
4. Banished/Cursed : TP **−50%**
5. Lieux saisonniers gratuits seulement pendant campaign

Lieux progression (quests) : Bluebell Hollow → Whispering Woods → Eldoria → Crystal Caverns → Skyreach Peak → Enchanted Oasis → Floating Gardens → Celestial Observatory → Isle of Whispers → The Citadel

→ [Quests](#quests) · [Dungeons](#dungeons)

---

## Combat : Hunting → Battling

### Hunting
Wiki : [Hunting](https://wiki.idle-mmo.com/combat/hunting)

- Avant battle : **Hunt** pour trouver des ennemis
- Spawn rate ↑ Hunting Mastery + Movement Speed (+ weather)
- Idle hunt jusqu’au cap idle
- Enemies decay 10%→2.5% / 4h selon Hunting Mastery
- Power Hunt : 2–5 min bonus · CD 12h (10h members)
- Combat level limite le niveau des ennemis huntables
- Pets ne huntent plus pour le personnage (depuis v0.23)

### Battling
Wiki : [Battling](https://wiki.idle-mmo.com/combat/battling)

- Stack jusqu’à **6** ennemis · idle jusqu’à défaite / fin / idle max
- **Food** = effective HP (ex. 100 HP + 20×10 food = 300)
- Food inutilisé rendu si cancel · priorité food faible
- Stances : Balanced / Offensive(Str) / Defensive / Agile(Speed) / Dexterous
- Min **3s / enemy** · min **1 damage** pris
- Scaling (experimental, member, Combat ≥80) : loot MF jusqu’à +40% selon gap de niveau

Early : hunt/battle **Rabbits** avec cooked Cod.

→ [Dungeons](#dungeons) · [World Bosses](#world-bosses) · [Pets](#pets)

---

## Dungeons

Wiki : [Dungeons](https://wiki.idle-mmo.com/combat/dungeons)

- Source principale de **Recipes**
- Entry si combat stats ≥ **70%** difficulty (AP+Prot+Agi+Acc)
- HP loss selon ratio stats/difficulty · MF bonus si stats ≫ difficulty (+30%)
- Complete dungeon → +1% permanent MF (stack)
- Chain si HP loss permet plusieurs runs dans idle
- >Lv70 : **Dungeon shards** → vendor (Dragon Soulstones, crystals, potions)

Exemples early :
| Dungeon | Req | Location | Cost | Time |
|---------|-----|----------|------|------|
| Millstone Mines | 3 | Bluebell Hollow | 300 | 2h |
| Vineyard Labyrinth | 10 | Bluebell Hollow | 1 200 | ~2h |

→ [Forge](#smelting--forge--alchemy) · [Quests](#quests)

---

## World Bosses

Wiki : [World Bosses](https://wiki.idle-mmo.com/combat/world-bosses)

- Meilleure source de **Pet Eggs**
- Queue jusqu’à **2h avant** start · fermée au début du fight
- Ex. Isadora (Lv1, Bluebell, 8h respawn) → Aquarion / Fluffly eggs

→ [Pets](#pets)

---

## Quests

Wiki : [Quests](https://wiki.idle-mmo.com/activities-and-challenges/quests)

- Quêtes liées au **lieu** (être présent)
- Objectifs : collect / deliver items (inventaire)
- Unlock lieux par **total quests completed** (ex. Woods=3, Eldoria=6, … Citadel=40)
- Chains + cooldowns sur quêtes suivantes

Priorité early : compléter quêtes Bluebell pour ouvrir la map.

→ [Map](#map--travelling)

---

## Économie

### Market
Wiki : [Market](https://wiki.idle-mmo.com/economy-and-trading/market)

- Listings (supply/demand) · expire 90j
- Purchase Orders : fee base **15%** (12% member) + durée
- Free : max 10 listings/orders · Member : 25
- Alts : total level 150
- Depuis 0.42 : fulfillment PO via listing auto-match (pas fulfill direct)

### Merchants
Wiki : [Merchants](https://wiki.idle-mmo.com/economy-and-trading/merchants)

- General Goods (Melriel) : bait, Metamorphite, Namestone, tools, vials…
- Satchel : character/inventory/pet/bank slots
- Celestial Exchange / Legacy Vault : shards → soulstones, pets, skins
- Shards : gameplay only (pas achat)

### Trading (P2P)
Wiki : [Trading](https://wiki.idle-mmo.com/economy-and-trading/trading)

- Fee 13% free / 10% member + 10g base si envoi
- Pets : min value rules · 1 seul côté peut envoyer pet
- Alts OK · alt total level 150

### Vendor
Sell collectables / surplus · train [Bartering](#skills-compétences)

→ [Décision](#décision--que-faire-maintenant)

---

## Items & equipment

Wiki : [Equipment](https://wiki.idle-mmo.com/items/equipment) · [Qualities](https://wiki.idle-mmo.com/items/qualities) · [Item types](https://wiki.idle-mmo.com/items/item-types)

### Qualities
Standard → Refined → Premium → Epic → Legendary → Mythic (+ Unique)

### Upgrade
Upgrade Stones · Mythic besoin Dragon Soulstone · caps par qualité (Std/Ref 5 · Prem/Epic 10 · Leg 12–16 · Myth 17–35)

### Obtenir gear
Recipes (dungeons/market) → Forge materials · ou acheter item direct market.

### Types clés
Weapons (Sword/Dagger/Bow) · Armor pieces · Tools (Pickaxe/Rod/Axe) · Ore/Log/Fish/Food · Bars · Potions · Essence Crystals · Recipes · Pet Eggs · Upgrade Stones

→ [Forge](#smelting--forge--alchemy)

---

## Pets

Wiki : [Pets overview](https://wiki.idle-mmo.com/pets/overview)

- Equip 1 pet → stats ajoutées au personnage
- Pet Mastery jusqu’à **+20%** stats pet (débute visible ~Lv44)
- Happiness / hunger
- Activities : battle · hunt · sleep (stamina regen **only while sleeping**)
- Evolution ×5 (+5% chosen stat / stage, reset level)
- Location lock : pet reste où il a fini · TP pet = 1/10 coût self
- Eggs : World Bosses / campaigns / market / exchange · incubation

Class Beastmaster boosts pet XP/mastery.

→ [World Bosses](#world-bosses) · [Combat](#combat--hunting--battling)

---

## Membership & daily

Wiki : [Membership](https://wiki.idle-mmo.com/character/membership) · [Daily](https://wiki.idle-mmo.com/character/daily-reward)

### Membership (QoL, gold in-game)
+ idle (main jusqu’à ~8h) · +15% EXP (pas Village) · +10% skill efficiency · market tax ↓ · listings 25 · ascension 10 pts / regen 6h · pets/inventory slots · trade fee 10% · streak MF jusqu’à 10% …

### Daily rewards
Reset **12:00 UTC** · streak → Magic Find (10j=1% … 50j=5% · member jusqu’à 100j=10%) · recovery streak 48h / 300 tokens

Toujours claim daily en début de session agent.

→ [Effects](#effects--magic-find)

---

## Ascension

Wiki : [Skills overview — Ascension](https://wiki.idle-mmo.com/skills/overview)

- Après skill Lv100 : +1 Ascension / 1 000 000 EXP · max Asc 500
- Points : max 8 (10 member) · regen 10h (6h member) · max 5 perks actifs
- Skills concernés : WC, Mining, Fishing, Alchemy, Smelting, Cooking, Forge, Construction, Hunting Mastery, Combat, Dungeoneering
- Points **partagés** entre skills

→ [Skills](#skills-compétences)

---

## Guilds

Wiki : [Guilds](https://wiki.idle-mmo.com/guilds/overview)

Communauté · bonuses · Assaults · Raids · Challenges · Seasons · Armoury · Guild Hall · Guild Mastery.

→ [Décision](#décision--que-faire-maintenant)

---

## Effects & Magic Find

Wiki : [Effects](https://wiki.idle-mmo.com/character/effects)

- Permanent (class, membership) vs Temporary (potions, scrolls, fatigue)
- Magic Find multiplie drop rates ; si total >100%, trim des items communs
- MF ne change pas toujours le “Chance of Loot” global (cf. scaling notes)
- Sources MF : streak daily, dungeons completed, scaling, scrolls type b, gear/effects

→ [Membership](#membership--daily) · [Dungeons](#dungeons)

---

## Progression playbooks

### A. Brand new character
1. Claim daily
2. [Mining Coal](#mining-playbook) → sell half
3. Buy bait → [Fish Cod](#woodcutting--fishing--cooking) → sell half / cook half
4. [Battle Rabbits](#combat--hunting--battling) with cooked food
5. [Quests](#quests) Bluebell → unlock map
6. Upgrade tools · consider 2nd char skilling class
7. Membership when gold comfortable
8. Dungeons Lv3+ for recipes

### B. Idle skilling session (6h+)
1. Observe Current Action / inventory space
2. Si idle libre : choisir skill bottleneck (Coal / food / bars / logs)
3. Start max-idle action on best available node ≤ level
4. Verify Current Action
5. Optionnel : pets sleep/hunt rotation

### C. Combat growth
1. Hunt stack
2. Food + stance
3. Battle
4. World boss queue if eligible
5. Dungeon when stats ≥ 70% difficulty

### D. Économie
1. Gather high-demand (Coal often)
2. Process (cook/smelt) si marge >
3. List on market (check orders)
4. Buy upgrades (tools, recipes)

→ [Décision](#décision--que-faire-maintenant)

---

## Décision : que faire maintenant ?

```
IF daily unclaimed → claim daily
ELSE IF Current Action running & time left > 15m → do side tasks (pets, market, quests) OR wait
ELSE IF inventory nearly full → sell/vendor/bank
ELSE IF Getting Started incomplete → finish next checklist item
ELSE IF gold low early → Coal mine / fish / sell
ELSE IF no food for planned combat → fish+cook
ELSE IF combat goal → hunt then battle (food ready)
ELSE IF dungeon affordable & stats OK → dungeon
ELSE IF world boss soon → queue
ELSE IF quest unlock needed → travel + quest
ELSE → skill the lowest useful bottleneck (Mining Coal default safe idle)
```

Toujours finir par [Vérification](#vérification).

---

## Apprentissage continu

Quand quelque chose échoue ou réussit autrement que prévu :

1. Screenshot + noter UI réelle
2. Re-fetch la page wiki concernée ([Index](#index-wiki))
3. Mettre à jour la section + [Mémoire runtime](#mémoire-runtime)
4. Si nouvelle coord → table coords
5. Si nouvelle règle métier → ajouter une ligne “Découverte” datée

Ne jamais inventer des drop rates / prix : vérifier market in-game ou wiki.

---

## Mémoire runtime

> Zone vivante — l’agent **doit** l’éditer après chaque session utile.

### Session / compte
| Clé | Valeur |
|-----|--------|
| Character | Rubix |
| Observed total level | ~37 (varies) |
| Mining | Lv.1 (early) |
| Desktop | Cursor Ubuntu XFCE `DISPLAY=:1` 1920×1200 |
| Game URL | https://web.idle-mmo.com/ |

### Coordonnées UI validées (Mining Coal)

| Élément | X | Y | Notes | Validé |
|---------|---|---|-------|--------|
| Coal Ore (ligne) | 913 | 422 | Page Mining | 2026-09-08 |
| Start (modale) | 992 | 739 | Après clic Coal | 2026-09-08 |

**Résultat :** Current Action = Coal Ore, timer ~6h, next item OK.

### Préférences contrôle
- Clics connus → `xdotool` only
- Computer Use réservé aux parcours inconnus
- Labels UI en **anglais**

### Découvertes
| Date | Note |
|------|------|
| 2026-09-08 | Start avec coords user fonctionne sans travel map préalable (contrairement à une hypothèse agent) |
| 2026-09-08 | Computer Use trop lent pour 2 clics ; xdotool ~1s |

### À calibrer (TODO)
- [ ] Sidebar Mining click
- [ ] Map open
- [ ] Market sell flow
- [ ] Fishing Cod + Start
- [ ] Cooking Start
- [ ] Battle / Hunt buttons
- [ ] Daily reward claim

→ Après calibration : remplir cette table et lier depuis les playbooks.

---

## Index wiki

| Thème | URL |
|-------|-----|
| Home | https://wiki.idle-mmo.com/ |
| Intro | https://wiki.idle-mmo.com/getting-started/introduction |
| Skills | https://wiki.idle-mmo.com/skills/overview |
| Construction | https://wiki.idle-mmo.com/skills/construction |
| Meditation | https://wiki.idle-mmo.com/skills/meditation |
| Village | https://wiki.idle-mmo.com/skills/village-mastery |
| Slayer (unreleased) | https://wiki.idle-mmo.com/skills/slayer |
| Classes | https://wiki.idle-mmo.com/character/classes |
| Stats | https://wiki.idle-mmo.com/character/stats |
| Membership | https://wiki.idle-mmo.com/character/membership |
| Effects | https://wiki.idle-mmo.com/character/effects |
| Daily | https://wiki.idle-mmo.com/character/daily-reward |
| Battling | https://wiki.idle-mmo.com/combat/battling |
| Hunting | https://wiki.idle-mmo.com/combat/hunting |
| Dungeons | https://wiki.idle-mmo.com/combat/dungeons |
| World Bosses | https://wiki.idle-mmo.com/combat/world-bosses |
| Weather | https://wiki.idle-mmo.com/combat/weather |
| Travelling | https://wiki.idle-mmo.com/activities-and-challenges/travelling |
| Quests | https://wiki.idle-mmo.com/activities-and-challenges/quests |
| Market | https://wiki.idle-mmo.com/economy-and-trading/market |
| Merchants | https://wiki.idle-mmo.com/economy-and-trading/merchants |
| Trading | https://wiki.idle-mmo.com/economy-and-trading/trading |
| Equipment | https://wiki.idle-mmo.com/items/equipment |
| Qualities | https://wiki.idle-mmo.com/items/qualities |
| Item types | https://wiki.idle-mmo.com/items/item-types |
| Pets | https://wiki.idle-mmo.com/pets/overview |
| Guilds | https://wiki.idle-mmo.com/guilds/overview |
| API (trackers) | https://wiki.idle-mmo.com/more/api |
| FAQs | https://wiki.idle-mmo.com/more/faqs |

---

*Fin du fichier. Point d’entrée agent : [SKILL.md](./SKILL.md).*
