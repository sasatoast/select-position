import { useState, useEffect } from 'react';
import './App.css';

// 環境変数からAPIのURLを取得（デフォルト: ローカル）
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface TimeSlot {
  id: number;
  label: string;
  assigned_to: string;
  position: number;
}

interface Class {
  id: number;
  name: string;
  date: string;
  time_slots: TimeSlot[];
}

function App() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [className, setClassName] = useState('');
  const [classDate, setClassDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/classes`);
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const createClass = async () => {
    if (!className.trim()) {
      alert('授業名を入力してください');
      return;
    }

    const filledSlots = timeSlots.filter((slot) => slot.trim() !== '');
    if (filledSlots.length === 0) {
      alert('少なくとも1つの時間帯を入力してください');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: className,
          date: classDate,
          time_slots: filledSlots,
        }),
      });

      if (response.ok) {
        setClassName('');
        setClassDate('');
        setTimeSlots(['', '', '', '', '', '']);
        setShowCreateForm(false);
        fetchClasses();
      }
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const duplicateClass = async (classId: number) => {
    if (!confirm('この授業を複製しますか？（担当者はクリアされます）')) return;

    try {
      const response = await fetch(`${API_URL}/classes/${classId}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error('Error duplicating class:', error);
    }
  };

  const deleteClass = async (classId: number) => {
    if (!confirm('この授業を削除してもよろしいですか？')) return;

    try {
      const response = await fetch(`${API_URL}/classes/${classId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const assignSlot = async (classId: number, slotId: number) => {
    const name = prompt('担当者の名前を入力してください:');
    if (name === null) return;

    try {
      const response = await fetch(
        `${API_URL}/classes/${classId}/slots/${slotId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assigned_to: name.trim(),
          }),
        }
      );

      if (response.ok) {
        fetchClasses();
      }
    } catch (error) {
      console.error('Error assigning slot:', error);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📚 授業担当管理</h1>
        <p>友人たちと授業の時間帯を分担しよう</p>
      </header>

      <div className="create-section">
        {!showCreateForm ? (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            + 新しい授業を作成
          </button>
        ) : (
          <div className="create-form">
            <h2>新しい授業を作成</h2>
            <input
              type="text"
              placeholder="授業名 (例: 数学IA)"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="input"
            />
            <input
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="input"
              placeholder="日付（任意）"
            />
            <div className="time-slots-input">
              <h3>時間帯を入力 (最大6つ)</h3>
              {timeSlots.map((slot, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`時間帯 ${index + 1} (例: 12:00-12:10)`}
                  value={slot}
                  onChange={(e) => {
                    const newSlots = [...timeSlots];
                    newSlots[index] = e.target.value;
                    setTimeSlots(newSlots);
                  }}
                  className="input input-small"
                />
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={createClass}>
                作成
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setClassName('');
                  setClassDate('');
                  setTimeSlots(['', '', '', '', '', '']);
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="classes-list">
        {classes.length === 0 ? (
          <div className="empty-state">
            <p>まだ授業が登録されていません</p>
            <p>「新しい授業を作成」ボタンから始めましょう</p>
          </div>
        ) : (
          classes.map((classItem) => (
            <div key={classItem.id} className="class-card">
              <div className="class-header">
                <div className="class-title">
                  <h2>{classItem.name}</h2>
                  {classItem.date && (
                    <span className="class-date">{classItem.date}</span>
                  )}
                </div>
                <div className="class-actions">
                  <button
                    className="btn btn-copy btn-small"
                    onClick={() => duplicateClass(classItem.id)}
                  >
                    📋 複製
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => deleteClass(classItem.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
              <div className="time-slots">
                {classItem.time_slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`time-slot ${
                      slot.assigned_to ? 'assigned' : ''
                    }`}
                    onClick={() => assignSlot(classItem.id, slot.id)}
                  >
                    <div className="slot-label">{slot.label}</div>
                    <div className="slot-assigned">
                      {slot.assigned_to || 'クリックして担当者を割り当て'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
