<template>
  <div class="min-h-screen p-4 pb-16 sm:pb-18 md:pb-20 font-poppins flex items-center justify-center main-bg">
    <!-- Текстура поверх фона -->
    <div class="texture-overlay"></div>

    <div class="max-w-[1360px] mx-auto space-y-4 w-full relative z-10">
      <!-- Top bar: Время + Календарь -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start relative mb-12">
        <!-- Часы -->
        <div class="flex items-center justify-center lg:justify-center lg:absolute left-0 right-0 bottom-0">
          <div class="text-center lg:text-left">
            <div class="clock-text text-gray-800">{{ formatTimeWithSeconds() }}</div>
          </div>
        </div>

        <!-- Календарь -->
        <div class="flex justify-center lg:justify-end">
          <div class="w-80 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg p-3 overflow-hidden flex flex-col calendar-card">
            <div class="rounded-2xl text-white text-center font-semibold tracking-wide py-2 mb-3 flex items-center justify-between px-3 calendar-header">
              <button @click="previousMonth" aria-label="Предыдущий месяц" class="w-7 h-7 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors">&#8249;</button>
              <span class="font-poppins text-base">{{ currentMonthNameWithYear }}</span>
              <button @click="nextMonth" aria-label="Следующий месяц" class="w-7 h-7 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors">&#8250;</button>
            </div>
            <div class="px-1 flex-1">
              <div class="grid grid-cols-7 text-center text-gray-500 font-medium text-[11px] pb-2 mb-1">
                <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
              </div>
              <div class="grid grid-cols-7 gap-y-1 text-center text-gray-700 text-[12px]">
                <div
                  v-for="day in calendarDays"
                  :key="day.date.toISOString()"
                  @click="selectDate(day)"
                  :class="[
                    'cursor-pointer hover:bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center mx-auto transition-colors text-[12px]',
                    !day.isCurrentMonth && 'text-gray-300',
                    day.isToday && !day.isSelected && 'today-highlight text-white font-bold',
                    day.isSelected && 'bg-[#5bb8a6] text-white font-bold'
                  ]"
                >
                  {{ day.day }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Prayer Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 xl:gap-3">
        <div v-for="(p, index) in prayers" :key="p.title" class="w-full max-w-[16rem] flex flex-col mx-auto mb-2">
          <h3 class="prayer-title text-gray-800 text-center mb-0 uppercase">{{ p.title }}</h3>
          <p class="prayer-title text-gray-400 text-center mb-3">{{ p.time }}</p>
          <div
            :class="`prayer-card-${index} w-full aspect-[9/16] rounded-2xl border border-white/50 relative overflow-hidden pb-2 flex flex-col glass-card`"
            :style="{ boxShadow: prayerCardGlows[index], background: prayerCardBgs[index] }"
          >
            <div class="prayer-card-content h-full overflow-y-auto pt-2 px-1">
              <!-- Элементы карточки -->
              <TransitionGroup name="list-item" tag="div">
                <div
                  v-for="(row, rowIndex) in cardRows(index)"
                  :key="rowKey(row)"
                  class="list-item-container relative mb-1"
                >
                  <!-- Свёрнутый блок -->
                  <div
                    :class="[
                      'collapsed-input-block h-9 mx-1.5 mt-2 rounded-xl flex items-center overflow-hidden transition-all duration-300 ease-in-out',
                      isRowExpanded(index, row) ? 'collapsed-hidden' : 'collapsed-visible',
                      row.kind === 'task' ? 'border border-gray-300 bg-white/50' : ''
                    ]"
                    :style="rowGradient(index, rowIndex, row)"
                  >
                    <input
                      @click="row.kind === 'task' && expandAndFocusText(index, row, $event)"
                      :value="rowText(row)"
                      :title="rowText(row)"
                      placeholder="Текст"
                      :class="[
                        'prayer-card-text border-none outline-none px-3 h-full flex-1 truncate w-full bg-transparent',
                        row.kind === 'fixed' ? 'cursor-default text-white text-center font-medium drop-shadow-sm' : 'cursor-pointer hover:bg-gray-50/50 text-gray-700'
                      ]"
                      readonly
                    />
                    <div v-if="row.kind === 'task' || rowTime(row)" class="h-full flex items-center">
                      <input
                        @click="row.kind === 'task' && expandAndFocusTime(index, row, $event)"
                        :value="rowTime(row)"
                        placeholder="Время"
                        :class="[
                          'prayer-card-text border-none outline-none h-full w-auto min-w-[60px] max-w-[110px] text-right placeholder:text-right px-2 whitespace-nowrap bg-transparent',
                          row.kind === 'fixed' ? 'cursor-default text-white/80' : 'cursor-pointer hover:bg-gray-50/50 text-gray-500'
                        ]"
                        readonly
                      />
                    </div>
                  </div>

                    <!-- Кружок статуса: завершить / вернуть задачу (правки N1, N3) -->
  <button
    v-show="row.kind === 'fixed' || !isRowExpanded(index, row)"
    type="button"
    @click.stop="toggleDone(row)"
    :aria-label="rowDone(row) ? 'Отметить задачу невыполненной' : 'Отметить задачу выполненной'"
    :title="rowDone(row) ? 'Выполнено (нажмите, чтобы вернуть в работу)' : 'Не выполнено (нажмите, чтобы завершить)'"
    :class="['task-status-badge', rowDone(row) ? 'task-status-done' : 'task-status-pending']"
  >
    <span v-if="rowDone(row)" aria-hidden="true">✓</span>
    <span v-else aria-hidden="true">✕</span>
  </button>
  <!-- Раскрывающийся блок -->
                  <div
                    v-if="row.kind === 'task'"
                    :class="[
                      'expandable-block mx-1.5 mt-0 overflow-hidden transition-all duration-300 ease-in-out',
                      isRowExpanded(index, row) ? 'expandable-block-open' : 'expandable-block-closed'
                    ]"
                  >
                    <div class="bg-white/80 border border-gray-200 rounded-xl backdrop-blur-sm flex flex-col">
                      <textarea
                        :value="rowText(row)" @input="onTaskTextInput(row, $event)"
                        @blur="handleExpandedBlur(index, row, $event)"
                        class="prayer-card-text w-full resize-none max-h-20 overflow-y-auto break-words text-gray-700 p-2 bg-transparent placeholder:text-gray-400"
                        placeholder="Введите текст"
                        aria-label="Текст элемента расписания"
                      ></textarea>
                      <input
                        class="prayer-card-text text-gray-700 bg-transparent border-none outline-none text-center p-1 placeholder:text-gray-400"
                        :value="rowTime(row)"
                        @blur="handleExpandedBlur(index, row, $event)"
                        @input="handleTimeInput(row, $event)"
                        placeholder="00:00 - 00:00"
                      />
                    </div>
                  </div>
                </div>
              </TransitionGroup>

              <!-- Кнопка добавления - обводка -->
              <div class="mt-3 ml-2 mb-2">
                <button @click="addNewInput(index)" :aria-label="`Добавить элемент в ${p.title}`" class="w-8 h-8 rounded-full text-gray-400 text-lg flex items-center justify-center border-2 border-gray-300 hover:border-gray-400 hover:text-gray-500 transition-colors bg-transparent">
                  <span>+</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
        <!-- Напоминание - стекло с тёплыми пятнами -->
        <div class="h-full">
          <div class="w-full rounded-2xl border border-white/50 shadow-lg transition-all duration-500 px-4 py-4 flex flex-col glass-card bottom-card">
            <h3 class="prayer-card-text text-gray-800 text-center mb-2 uppercase">Напоминание</h3>
            <div class="w-full h-full flex-1 reminder-scroll-area">
              <textarea class="w-full h-full min-h-0 bg-transparent outline-none placeholder:text-gray-500/60 resize-none text-gray-800 p-2 reminder-textarea" placeholder="Введите напоминание" aria-label="Напоминание"></textarea>
            </div>
          </div>
        </div>

        <!-- Заметки - стекло с бирюзовыми пятнами -->
        <div class="h-full">
          <div class="w-full rounded-2xl border border-white/50 shadow-lg transition-all duration-500 px-4 py-4 flex flex-col glass-card bottom-card">
            <h3 class="prayer-card-text text-gray-800 text-center mb-2 shrink-0 uppercase">Заметки</h3>
            <div class="flex flex-col min-h-0 flex-1">
              <div class="overflow-y-auto flex-1 min-h-0 space-y-2 notes-scroll pr-1">
                <div v-for="(note, noteIndex) in notes" :key="noteIndex" class="mb-2 relative">
                  <textarea
                    v-model="note.text"
                    @focus="focusNote(noteIndex)"
                    @blur="blurNote(noteIndex)"
                    :class="[
                      'w-full resize-none overflow-y-auto text-gray-800 bg-white/30 backdrop-blur-sm shadow-inner ring-1 ring-white/40 rounded-lg outline-none px-3 py-2 transition-all duration-300 ease-in-out',
                      note.focused ? 'note-expanded' : 'note-collapsed'
                    ]"
                    placeholder="Введите текст"
                    :aria-label="`Заметка ${noteIndex + 1}`"
                  ></textarea>
                  <Transition name="fade">
                    <button
                      v-if="note.focused && notes.length > 1"
                      @mousedown.prevent="deleteNote(noteIndex)"
                      :aria-label="`Удалить заметку ${noteIndex + 1}`"
                      class="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm bg-white/90 rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-all hover:scale-110"
                    >
                      ✕
                    </button>
                  </Transition>
                </div>
              </div>
              <button
                @click="addNewNote"
                aria-label="Добавить заметку"
                class="w-full h-10 rounded-full bg-white/30 hover:bg-white/50 text-gray-800 font-medium transition-colors flex items-center justify-center shrink-0 mt-2 backdrop-blur-sm"
              >
                <span class="text-lg mr-2">+</span>
                Добавить заметку
              </button>
            </div>
          </div>
        </div>

        <!-- Трекер - стекло с зелёными пятнами -->
        <div class="h-full">
          <div class="w-full rounded-2xl border border-white/50 shadow-lg transition-all duration-500 p-4 flex flex-col glass-card bottom-card">
            <h3 class="prayer-card-text text-gray-800 text-center mb-5 uppercase">Трекер</h3>
            <div class="space-y-4 flex-1 flex flex-col justify-center">
              <!-- Поклонения -->
              <div>
                <p class="text-gray-600 text-center text-sm font-medium mb-2 tracking-wide">Поклонения</p>
                <div class="w-full h-14 rounded-2xl tracker-bar-worship"></div>
              </div>
              <!-- Дела -->
              <div>
                <p class="text-gray-600 text-center text-sm font-medium mb-2 tracking-wide">Дела</p>
                <div class="w-full h-14 rounded-2xl tracker-bar-tasks"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

interface PrayerCard {
  title: string
  time: string
}

interface Input {
  id: string
  expanded: boolean
  time: string
  text: string
  isFixed: boolean
  done: boolean
  isPinned?: boolean
}
interface Task {
  id: string
  text: string
  time: string
  start: number | null
  end: number | null
  done: boolean
  draftCard: number | null
}

interface CardRowFixed {
  kind: 'fixed'
  input: Input
}

interface CardRowTask {
  kind: 'task'
  task: Task
}

type CardRow = CardRowFixed | CardRowTask


const prayers: PrayerCard[] = [
  { title: 'Фаджр', time: '04:00' },
  { title: 'Зухр', time: '11:00' },
  { title: 'Аср', time: '16:00' },
  { title: 'Магриб', time: '19:00' },
  { title: 'Иша', time: '21:00' },
]

// Свечение вокруг карточек молитв (разные цвета)
const prayerCardGlows = [
  '0 0 20px rgba(244, 114, 182, 0.4), 0 0 40px rgba(244, 114, 182, 0.15)', // Фаджр - розовый
  '0 0 20px rgba(74, 222, 128, 0.4), 0 0 40px rgba(74, 222, 128, 0.15)',   // Зухр - зелёный
  '0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.15)',   // Аср - оранжевый
  '0 0 20px rgba(96, 165, 250, 0.4), 0 0 40px rgba(96, 165, 250, 0.15)',   // Магриб - синий
  '0 0 20px rgba(167, 139, 250, 0.4), 0 0 40px rgba(167, 139, 250, 0.15)', // Иша - фиолетовый
]

// Стеклянный фон с цветными пятнами для карточек молитв
const prayerCardBgs = [
  // Фаджр - розовые/персиковые пятна
  'radial-gradient(circle at 20% 30%, rgba(244, 114, 182, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(251, 113, 133, 0.35) 0%, transparent 45%), radial-gradient(circle at 50% 90%, rgba(249, 168, 212, 0.3) 0%, transparent 40%), rgba(255,255,255,0.45)',
  // Зухр - зелёные/бирюзовые пятна
  'radial-gradient(circle at 30% 25%, rgba(0, 244, 224, 0.45) 0%, transparent 50%), radial-gradient(circle at 75% 65%, rgba(74, 222, 128, 0.35) 0%, transparent 45%), radial-gradient(circle at 15% 80%, rgba(52, 211, 153, 0.3) 0%, transparent 40%), rgba(255,255,255,0.45)',
  // Аср - оранжевые/жёлтые пятна
  'radial-gradient(circle at 70% 20%, rgba(251, 191, 36, 0.45) 0%, transparent 50%), radial-gradient(circle at 25% 75%, rgba(251, 146, 60, 0.35) 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(253, 224, 71, 0.3) 0%, transparent 40%), rgba(255,255,255,0.45)',
  // Магриб - синие/голубые пятна
  'radial-gradient(circle at 25% 35%, rgba(96, 165, 250, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 25%, rgba(56, 189, 248, 0.35) 0%, transparent 45%), radial-gradient(circle at 40% 85%, rgba(99, 102, 241, 0.3) 0%, transparent 40%), rgba(255,255,255,0.45)',
  // Иша - фиолетовые/сиреневые пятна
  'radial-gradient(circle at 65% 30%, rgba(167, 139, 250, 0.45) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(192, 132, 252, 0.35) 0%, transparent 45%), radial-gradient(circle at 75% 80%, rgba(216, 180, 254, 0.3) 0%, transparent 40%), rgba(255,255,255,0.45)',
]

// Градиенты для фиксированных элементов внутри карточек
const prayerItemGradients = [
  ['linear-gradient(90deg, #f472b6, #fb7185)', 'linear-gradient(90deg, #f9a8d4, #c084fc)', 'linear-gradient(90deg, #fda4af, #f472b6)'],     // Фаджр - розовые
  ['linear-gradient(90deg, #34d399, #4ade80)', 'linear-gradient(90deg, #6ee7b7, #a3e635)', 'linear-gradient(90deg, #86efac, #34d399)'],     // Зухр - зелёные
  ['linear-gradient(90deg, #fbbf24, #f59e0b)', 'linear-gradient(90deg, #fb923c, #f472b6)', 'linear-gradient(90deg, #fde047, #84cc16)'],     // Аср - оранжевые
  ['linear-gradient(90deg, #60a5fa, #818cf8)', 'linear-gradient(90deg, #38bdf8, #6366f1)', 'linear-gradient(90deg, #93c5fd, #60a5fa)'],     // Магриб - синие
  ['linear-gradient(90deg, #a78bfa, #c084fc)', 'linear-gradient(90deg, #c4b5fd, #f0abfc)', 'linear-gradient(90deg, #d8b4fe, #a78bfa)'],     // Иша - фиолетовые
]

const namazItemGradient = 'linear-gradient(90deg, #5bb8a6 0%, #4ecdc4 48%, #45b7d1 100%)'

const getPrayerItemGradient = (cardIndex: number, inputIndex: number, input: Input) => {
  if (input.text.trim().toUpperCase() === 'НАМАЗ') return namazItemGradient
  return prayerItemGradients[cardIndex][inputIndex % 3]
}
const rowGradient = (cardIndex: number, rowIndex: number, row: CardRow) => {
  if (row.kind !== 'fixed') return {}
  return { background: getPrayerItemGradient(cardIndex, rowIndex, row.input) }
}


const getInitialInputsForPrayer = (prayer: PrayerCard): Input[] => {
  switch(prayer.title) {
    case 'Фаджр':
    case 'Зухр':
      return [
        {
          id: `ratibat-${prayer.title}-${Date.now()}-1`,
          expanded: false,
          time: '',
          text: 'Ратибат',
          isFixed: true,
          done: false
        },
        {
          id: `namaz-${prayer.title}-${Date.now()}-2`,
          expanded: false,
          time: '',
          text: 'НАМАЗ',
          isFixed: true,
          done: false
        },
        {
          id: `azkary-${prayer.title}-${Date.now()}-3`,
          expanded: false,
          time: '',
          text: 'Азкары',
          isFixed: true,
          done: false
        }
      ]

    case 'Аср':
    case 'Магриб':
      return [
        {
          id: `namaz-${prayer.title}-${Date.now()}-1`,
          expanded: false,
          time: '',
          text: 'НАМАЗ',
          isFixed: true,
          done: false
        },
        {
          id: `ratibat-${prayer.title}-${Date.now()}-2`,
          expanded: false,
          time: '',
          text: 'Ратибат',
          isFixed: true,
          done: false
        }
      ]

    case 'Иша':
      return [
        {
          id: `namaz-${prayer.title}-${Date.now()}-1`,
          expanded: false,
          time: '',
          text: 'НАМАЗ',
          isFixed: true,
          done: false
        },
        {
          id: `ratibat-${prayer.title}-${Date.now()}-2`,
          expanded: false,
          time: '',
          text: 'Ратибат',
          isFixed: true,
          done: false
        },
        {
          id: `tahajjud-${prayer.title}-${Date.now()}-3`,
          expanded: false,
          time: '',
          text: 'Тахаджуд',
          isFixed: true,
          done: false,
          isPinned: true
        }
      ]

    default:
      return [
        {
          id: `fixed-${prayer.title}-${Date.now()}`,
          expanded: false,
          time: '',
          text: 'Намаз',
          isFixed: true,
          done: false
        }
      ]
  }
}

const currentDate = ref(new Date())
const selectedDate = ref(new Date())

const fixedInputs = ref(prayers.map(prayer => getInitialInputsForPrayer(prayer)))

const tasks = ref<Task[]>([])

const expandedKey = ref<string | null>(null)


// Notes state
const notes = ref([
  { focused: false, text: '' },
  { focused: false, text: '' },
  { focused: false, text: '' },
  { focused: false, text: '' }
])

const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

const currentMonthName = computed(() => monthNames[currentMonth.value])
const currentMonthNameWithYear = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`)

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)

  // Начинаем с понедельника
  const startDate = new Date(firstDay)
  const dayOfWeek = firstDay.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  startDate.setDate(startDate.getDate() - mondayOffset)

  const days = []
  const endDate = new Date(lastDay)
  const lastDayOfWeek = lastDay.getDay()
  const sundayOffset = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek
  endDate.setDate(endDate.getDate() + sundayOffset)

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push({
      date: new Date(d),
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === currentMonth.value,
      isToday: d.toDateString() === new Date().toDateString(),
      isSelected: d.toDateString() === selectedDate.value.toDateString()
    })
  }
  return days
})

const MINUTES_IN_DAY = 24 * 60

const prayerStartMinutes = computed(() =>
  prayers.map(p => {
    const [h, m] = p.time.split(':').map(Number)
    return h * 60 + (m || 0)
  })
)

const cardInterval = (cardIndex: number): { start: number; end: number } => {
  const starts = prayerStartMinutes.value
  const start = starts[cardIndex]
  const end = cardIndex + 1 < starts.length ? starts[cardIndex + 1] : starts[0] + MINUTES_IN_DAY
  return { start, end }
}

const parseTimeRange = (value: string): { start: number; end: number } | null => {
  const parts = value.match(/(\d{1,2}):(\d{2})/g)
  if (!parts || parts.length === 0) return null
  const toMin = (s: string): number | null => {
    const [h, m] = s.split(':').map(Number)
    if (h > 23 || m > 59) return null
    return h * 60 + m
  }
  const first = toMin(parts[0])
  if (first === null) return null
  if (parts.length === 1) return { start: first, end: first }
  const second = toMin(parts[1])
  if (second === null) return { start: first, end: first }
  const end = second < first ? second + MINUTES_IN_DAY : second
  return { start: first, end }
}

const rangesOverlap = (aStart: number, aEnd: number, bStart: number, bEnd: number): boolean => {
  if (aStart === aEnd) return aStart >= bStart && aStart < bEnd
  return aStart < bEnd && bStart < aEnd
}

const taskOverlapsCard = (task: Task, cardIndex: number): boolean => {
  if (task.start === null || task.end === null) return false
  const { start: cs, end: ce } = cardInterval(cardIndex)
  for (const shift of [0, MINUTES_IN_DAY, -MINUTES_IN_DAY]) {
    if (rangesOverlap(task.start + shift, task.end + shift, cs, ce)) return true
  }
  return false
}

const tasksForCard = (cardIndex: number): Task[] => {
  return tasks.value.filter(task => {
    if (taskOverlapsCard(task, cardIndex)) return true
    if ((task.start === null || task.end === null) && task.draftCard === cardIndex) return true
    if (expandedKey.value === `${cardIndex}:${task.id}`) return true
    return false
  })
}

const cardRows = (cardIndex: number): CardRow[] => {
  const fixed = fixedInputs.value[cardIndex]
  const rows: CardRow[] = fixed
    .filter(f => !f.isPinned)
    .map(input => ({ kind: 'fixed' as const, input }))
  for (const task of tasksForCard(cardIndex)) {
    rows.push({ kind: 'task' as const, task })
  }
  for (const input of fixed.filter(f => f.isPinned)) {
    rows.push({ kind: 'fixed' as const, input })
  }
  return rows
}

const rowKey = (row: CardRow): string => (row.kind === 'task' ? row.task.id : row.input.id)
const rowText = (row: CardRow): string => (row.kind === 'task' ? row.task.text : row.input.text)
const rowTime = (row: CardRow): string => (row.kind === 'task' ? row.task.time : row.input.time)
const rowDone = (row: CardRow): boolean => (row.kind === 'task' ? row.task.done : row.input.done)
const isRowExpanded = (cardIndex: number, row: CardRow): boolean =>
  row.kind === 'task' && expandedKey.value === `${cardIndex}:${row.task.id}`

const commitTaskTime = (task: Task) => {
  const parsed = parseTimeRange(task.time)
  if (parsed) {
    task.start = parsed.start
    task.end = parsed.end
    task.draftCard = null
  }
}

const onTaskTextInput = (row: CardRow, event: Event) => {
  if (row.kind !== 'task') return
  row.task.text = (event.target as HTMLTextAreaElement).value
}

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const formatTimeInput = (value: string) => {
  const digits = value.replace(/\D/g, '')
  let formatted = ''
  if (digits.length >= 1) formatted += digits.slice(0, 2)
  if (digits.length >= 3) formatted += ':' + digits.slice(2, 4)
  if (digits.length >= 5) formatted += ' - ' + digits.slice(4, 6)
  if (digits.length >= 7) formatted += ':' + digits.slice(6, 8)
  return formatted
}

const handleTimeInput = (row: CardRow, event: Event) => {
  if (row.kind !== 'task') return
  const target = event.target as HTMLInputElement
  row.task.time = formatTimeInput(target.value)
}


const expandAndFocus = (cardIndex: number, row: CardRow, field: 'text' | 'time', event: Event) => {
  if (row.kind !== 'task') return
  const key = `${cardIndex}:${row.task.id}`
  if (expandedKey.value === key) {
    expandedKey.value = null
    return
  }
  expandedKey.value = key
  const container = (event.currentTarget as HTMLElement | null)?.closest('.list-item-container')
  nextTick(() => {
    if (!container) return
    const target =
      field === 'text'
        ? container.querySelector('textarea')
        : container.querySelector('.expandable-block-open input')
    ;(target as HTMLElement | null)?.focus()
  })
}

const expandAndFocusText = (cardIndex: number, row: CardRow, event: Event) =>
  expandAndFocus(cardIndex, row, 'text', event)

const expandAndFocusTime = (cardIndex: number, row: CardRow, event: Event) =>
  expandAndFocus(cardIndex, row, 'time', event)


const addNewInput = (cardIndex: number) => {
  const task: Task = {
    id: `new-${Date.now()}-${Math.random()}`,
    text: '',
    time: '',
    start: null,
    end: null,
    done: false,
    draftCard: cardIndex
  }
  tasks.value.push(task)
}


const toggleDone = (row: CardRow) => {
  if (row.kind === 'fixed') {
    row.input.done = !row.input.done
  } else {
    row.task.done = !row.task.done
  }
}


const handleExpandedBlur = (cardIndex: number, row: CardRow, event: FocusEvent) => {
  if (row.kind !== 'task') return
  const taskId = row.task.id
  commitTaskTime(row.task)
  const container = (event.target as HTMLElement | null)?.closest('.list-item-container')
  setTimeout(() => {
    const activeElement = document.activeElement
    if (container && (!activeElement || !container.contains(activeElement))) {
      if (expandedKey.value === `${cardIndex}:${taskId}`) {
        expandedKey.value = null
      }
    }
  }, 100)
}


const focusNote = (noteIndex: number) => {
  if (notes.value[noteIndex]) {
    notes.value[noteIndex].focused = true
  }
}

const blurNote = (noteIndex: number) => {
  if (notes.value[noteIndex]) {
    notes.value[noteIndex].focused = false
  }
}

const deleteNote = (noteIndex: number) => {
  if (notes.value.length > 1) {
    notes.value.splice(noteIndex, 1)
  }
}

const addNewNote = () => {
  notes.value.push({ focused: false, text: '' })
}

interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
}

const selectDate = (day: CalendarDay) => {
  selectedDate.value = new Date(day.date)
}

const currentTime = ref(new Date())

const formatTimeWithSeconds = () => {
  return currentTime.value.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.font-poppins {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Основной фон - bg.png */
.main-bg {
  background-color: #f4f3ee;
  background-image: url('/bg.png');
  background-repeat: repeat;
  background-size: auto;
  background-blend-mode: screen;
  position: relative;
}

/* Текстура поверх фона */
.texture-overlay {
  position: fixed;
  inset: 0;
  background: url('/Texture.png') repeat;
  background-size: auto;
  opacity: 0.68;
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 1;
}

/* Стиль часов: Poppins 400 40px 12% letter-spacing */
.clock-text {
  font-family: 'Poppins', sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 40px;
  line-height: 100%;
  letter-spacing: 0.12em;
}

/* Стиль заголовка намаза и времени: Inter 400 16px 12% letter-spacing */
.prayer-title {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 16px;
  line-height: 100%;
  letter-spacing: 0.12em;
}

/* Стиль текста внутри карточки намаза: Inter 400 15px 12% letter-spacing */
.prayer-card-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 15px;
  line-height: 100%;
  letter-spacing: 0.12em;
}

/* Стеклянная карточка - общий стиль для календаря, намаза, нижних блоков */
.glass-card {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.bottom-card {
  height: 20rem;
  min-height: 20rem;
  background: radial-gradient(circle at 16% 18%, rgba(255, 255, 255, 0.78) 0%, transparent 34%),
    radial-gradient(circle at 82% 18%, rgba(91, 184, 166, 0.3) 0%, transparent 42%),
    radial-gradient(circle at 78% 78%, rgba(69, 183, 209, 0.24) 0%, transparent 42%),
    radial-gradient(circle at 22% 84%, rgba(166, 125, 216, 0.18) 0%, transparent 38%),
    rgba(255, 255, 255, 0.58);
}

/* Календарь */
.calendar-card {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.calendar-header {
  background: linear-gradient(135deg, #5bb8a6, #4ecdc4, #45b7d1);
}

/* Подсветка сегодняшней даты */
.today-highlight {
  background: linear-gradient(135deg, #a8e063, #56ab2f);
}

/* Трекер - полоса Поклонения (зелёный градиент) */
.tracker-bar-worship {
  background: linear-gradient(90deg, #34d399, #4ade80, #86efac);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
}

/* Трекер - полоса Дела (голубой градиент) */
.tracker-bar-tasks {
  background: linear-gradient(90deg, #38bdf8, #22d3ee, #67e8f9);
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
}

/* Скроллбар для Напоминания */
.reminder-textarea {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.5) transparent;
}

.reminder-textarea::-webkit-scrollbar {
  width: 4px;
}

.reminder-textarea::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px 0;
}

.reminder-textarea::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.5);
  border-radius: 10px;
}

.reminder-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.7);
}

/* Анимации для карточек */
.list-item-enter-active,
.list-item-leave-active {
  transition: all 0.5s ease;
}

.list-item-enter-from,
.list-item-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
  margin-bottom: 0;
  overflow: hidden;
}

.list-item-enter-to,
.list-item-leave-from {
  max-height: 150px;
}

.expandable-content {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-out, opacity 0.3s ease;
}

.expandable-content.expanded {
  max-height: 120px;
  opacity: 1;
}

/* Стили для заметок */
.note-collapsed {
  height: 2.5rem;
  min-height: 2.5rem;
  max-height: 2.5rem;
  line-height: 1.5rem;
}

.note-expanded {
  height: 5.5rem;
  min-height: 5.5rem;
  max-height: 5.5rem;
}

/* Кружок статуса задачи в правом верхнем углу плашки (правки N1, N3) */
.task-status-badge {
  position: absolute;
  top: -7px;
  right: 0;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  color: #fff;
  border: 2px solid #fff;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 5;
  padding: 0;
  transition: transform 0.15s ease, background-color 0.2s ease;
}
.task-status-badge:hover {
  transform: scale(1.15);
}
.task-status-badge:active {
  transform: scale(0.95);
}
.task-status-done {
  background-color: #22c55e;
}
.task-status-pending {
  background-color: #ef4444;
}

/* Анимация для кнопки удаления */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expandable-block {
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease-in-out,
              margin-top 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.expandable-block-closed {
  max-height: 0;
  opacity: 0;
  pointer-events: none;
}

.expandable-block-open {
  max-height: 250px;
  opacity: 1;
}

/* Анимация для свернутого блока */
.collapsed-input-block {
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease-in-out,
              margin 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapsed-visible {
  max-height: 2.25rem;
  opacity: 1;
}

.collapsed-hidden {
  max-height: 0;
  opacity: 0;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  pointer-events: none;
}

/* Скроллбар для блока заметок */
.notes-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.5) transparent;
}

.notes-scroll::-webkit-scrollbar {
  width: 4px;
}

.notes-scroll::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px 0;
}

.notes-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.5);
  border-radius: 10px;
}

.notes-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.7);
}

/* Скроллбар для карточек молитв */
[class*="prayer-card-content"] {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.15) transparent;
}

[class*="prayer-card-content"]::-webkit-scrollbar {
  width: 3px;
}

[class*="prayer-card-content"]::-webkit-scrollbar-track {
  background: transparent;
  margin: 8px 0;
}

[class*="prayer-card-content"]::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
}

[class*="prayer-card-content"]::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.25);
}

[class*="prayer-card-content"]::-webkit-scrollbar-button {
  display: none;
}
</style>
