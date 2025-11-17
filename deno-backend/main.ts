/// <reference lib="deno.unstable" />

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

// Deno KVを初期化
const kv = await Deno.openKv();

// 型定義
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

// CORS設定
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://select-position.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Allow-Credentials': 'true',
};

// ユニークIDを生成
function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// メインハンドラー
async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // GET /api/classes - 授業一覧取得
    if (path === '/api/classes' && req.method === 'GET') {
      const entries = kv.list({ prefix: ['classes'] });
      const classes: Class[] = [];

      for await (const entry of entries) {
        classes.push(entry.value as Class);
      }

      // IDの降順でソート
      classes.sort((a, b) => b.id - a.id);

      return new Response(JSON.stringify(classes), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /api/classes/:id - 授業詳細取得
    if (path.match(/^\/api\/classes\/\d+$/) && req.method === 'GET') {
      const id = parseInt(path.split('/').pop()!);
      const result = await kv.get<Class>(['classes', id]);

      if (!result.value) {
        return new Response(JSON.stringify({ error: 'Class not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(result.value), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /api/classes - 授業作成
    if (path === '/api/classes' && req.method === 'POST') {
      const body = await req.json();
      const { name, date, time_slots } = body;

      const classId = generateId();
      const timeSlots: TimeSlot[] = time_slots.map(
        (label: string, index: number) => ({
          id: generateId() + index,
          label,
          assigned_to: '',
          position: index,
        })
      );

      const newClass: Class = {
        id: classId,
        name,
        date: date || '',
        time_slots: timeSlots,
      };

      await kv.set(['classes', classId], newClass);

      return new Response(
        JSON.stringify({ id: classId, message: 'Class created successfully' }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // POST /api/classes/:id/duplicate - 授業複製
    if (
      path.match(/^\/api\/classes\/\d+\/duplicate$/) &&
      req.method === 'POST'
    ) {
      const id = parseInt(path.split('/')[3]);
      const result = await kv.get<Class>(['classes', id]);

      if (!result.value) {
        return new Response(JSON.stringify({ error: 'Class not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const originalClass = result.value;
      const newClassId = generateId();

      // タイムスロットを複製（担当者はクリア）
      const newTimeSlots: TimeSlot[] = originalClass.time_slots.map(
        (slot, index) => ({
          id: generateId() + index,
          label: slot.label,
          assigned_to: '',
          position: slot.position,
        })
      );

      const newClass: Class = {
        id: newClassId,
        name: originalClass.name,
        date: '',
        time_slots: newTimeSlots,
      };

      await kv.set(['classes', newClassId], newClass);

      return new Response(
        JSON.stringify({
          id: newClassId,
          message: 'Class duplicated successfully',
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // DELETE /api/classes/:id - 授業削除
    if (path.match(/^\/api\/classes\/\d+$/) && req.method === 'DELETE') {
      const id = parseInt(path.split('/').pop()!);
      await kv.delete(['classes', id]);

      return new Response(
        JSON.stringify({ message: 'Class deleted successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // PUT /api/classes/:classId/slots/:slotId - タイムスロット更新
    if (
      path.match(/^\/api\/classes\/\d+\/slots\/\d+$/) &&
      req.method === 'PUT'
    ) {
      const parts = path.split('/');
      const classId = parseInt(parts[3]);
      const slotId = parseInt(parts[5]);

      const body = await req.json();
      const { assigned_to } = body;

      const result = await kv.get<Class>(['classes', classId]);

      if (!result.value) {
        return new Response(JSON.stringify({ error: 'Class not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const classData = result.value;
      const slotIndex = classData.time_slots.findIndex((s) => s.id === slotId);

      if (slotIndex === -1) {
        return new Response(JSON.stringify({ error: 'Time slot not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      classData.time_slots[slotIndex].assigned_to = assigned_to;
      await kv.set(['classes', classId], classData);

      return new Response(
        JSON.stringify({ message: 'Slot assigned successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 404
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// サーバー起動
console.log('🦕 Deno server running on port 8000');
serve(handler, { port: 8000 });
